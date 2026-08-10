package com.zoadex.api.social;

import com.zoadex.api.common.exception.BadRequestException;
import com.zoadex.api.common.exception.ResourceNotFoundException;
import com.zoadex.api.sighting.Sighting;
import com.zoadex.api.sighting.SightingRepository;
import com.zoadex.api.species.Species;
import com.zoadex.api.species.SpeciesRepository;
import com.zoadex.api.user.User;
import com.zoadex.api.user.UserRepository;
import com.zoadex.api.xp.XpService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SocialService {

    private final SightingCommentRepository commentRepository;
    private final SightingConfirmationRepository confirmationRepository;
    private final SightingRepository sightingRepository;
    private final UserRepository userRepository;
    private final SpeciesRepository speciesRepository;
    private final NotificationService notificationService;
    private final XpService xpService;

    // --- Comments ---

    @Transactional
    public SightingComment addComment(UUID userId, UUID sightingId, String text) {
        if (text == null || text.isBlank()) {
            throw new BadRequestException("Comment text cannot be empty");
        }
        if (text.length() > 1000) {
            throw new BadRequestException("Comment too long (max 1000 characters)");
        }

        Sighting sighting = sightingRepository.findById(sightingId)
                .orElseThrow(() -> new ResourceNotFoundException("Sighting", "id", sightingId));

        SightingComment comment = SightingComment.builder()
                .sightingId(sightingId)
                .userId(userId)
                .text(text.trim())
                .build();
        comment = commentRepository.save(comment);

        // Notify sighting owner (unless they commented on their own)
        if (!sighting.getUserId().equals(userId)) {
            User commenter = userRepository.findById(userId).orElse(null);
            String commenterName = commenter != null ? commenter.getUsername() : "Someone";
            notificationService.notify(
                    sighting.getUserId(),
                    "COMMENT",
                    commenterName + " commented on your sighting",
                    text.length() > 100 ? text.substring(0, 100) + "..." : text,
                    sightingId
            );
        }

        return comment;
    }

    public List<SightingComment> getComments(UUID sightingId) {
        return commentRepository.findBySightingIdOrderByCreatedAtAsc(sightingId);
    }

    // --- Confirmations ---

    @Transactional
    public void confirmSighting(UUID userId, UUID sightingId) {
        Sighting sighting = sightingRepository.findById(sightingId)
                .orElseThrow(() -> new ResourceNotFoundException("Sighting", "id", sightingId));

        if (sighting.getUserId().equals(userId)) {
            throw new BadRequestException("You cannot confirm your own sighting");
        }

        if (confirmationRepository.existsBySightingIdAndUserId(sightingId, userId)) {
            throw new BadRequestException("You already confirmed this sighting");
        }

        SightingConfirmation confirmation = SightingConfirmation.builder()
                .sightingId(sightingId)
                .userId(userId)
                .build();
        confirmationRepository.save(confirmation);

        // Award XP to the sighting owner for getting confirmed
        xpService.awardXp(sighting.getUserId(), 15, "CONFIRMATION_RECEIVED",
                "Your sighting was confirmed by another explorer", sightingId);

        // Notify sighting owner
        User confirmer = userRepository.findById(userId).orElse(null);
        String confirmerName = confirmer != null ? confirmer.getUsername() : "Someone";
        notificationService.notify(
                sighting.getUserId(),
                "CONFIRMATION",
                confirmerName + " confirmed your species ID",
                null,
                sightingId
        );
    }

    @Transactional
    public void removeConfirmation(UUID userId, UUID sightingId) {
        confirmationRepository.findBySightingIdAndUserId(sightingId, userId)
                .ifPresent(confirmationRepository::delete);
    }

    public long getConfirmationCount(UUID sightingId) {
        return confirmationRepository.countBySightingId(sightingId);
    }

    public boolean hasUserConfirmed(UUID userId, UUID sightingId) {
        return confirmationRepository.existsBySightingIdAndUserId(sightingId, userId);
    }

    // --- Discovery Feed (regional) ---

    public List<Sighting> getRegionFeed(UUID regionId, int page, int size) {
        // Get recent public sightings from users in this region
        return sightingRepository.findRecentByRegion(regionId, PageRequest.of(page, size));
    }
}
