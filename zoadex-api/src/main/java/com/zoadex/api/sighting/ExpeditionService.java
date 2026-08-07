package com.zoadex.api.sighting;

import com.zoadex.api.common.exception.BadRequestException;
import com.zoadex.api.common.exception.ResourceNotFoundException;
import com.zoadex.api.sighting.dto.ExpeditionResponse;
import com.zoadex.api.sighting.dto.StartExpeditionRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ExpeditionService {

    private final ExpeditionRepository expeditionRepository;
    private final SightingRepository sightingRepository;

    @Transactional
    public ExpeditionResponse startExpedition(UUID userId, StartExpeditionRequest request) {
        // Check if user already has an active expedition
        expeditionRepository.findByUserIdAndEndedAtIsNull(userId)
                .ifPresent(e -> {
                    throw new BadRequestException("You already have an active expedition. End it first.");
                });

        Expedition expedition = Expedition.builder()
                .userId(userId)
                .startedAt(LocalDateTime.now())
                .notes(request.getNotes())
                .build();

        expedition = expeditionRepository.save(expedition);
        return toResponse(expedition, 0);
    }

    @Transactional
    public ExpeditionResponse endExpedition(UUID userId, UUID expeditionId) {
        Expedition expedition = expeditionRepository.findById(expeditionId)
                .orElseThrow(() -> new ResourceNotFoundException("Expedition", "id", expeditionId));

        if (!expedition.getUserId().equals(userId)) {
            throw new BadRequestException("This expedition does not belong to you");
        }

        if (expedition.getEndedAt() != null) {
            throw new BadRequestException("Expedition already ended");
        }

        expedition.setEndedAt(LocalDateTime.now());
        expeditionRepository.save(expedition);

        int sightingCount = sightingRepository.findByExpeditionId(expeditionId).size();
        return toResponse(expedition, sightingCount);
    }

    public Optional<ExpeditionResponse> getActiveExpedition(UUID userId) {
        return expeditionRepository.findByUserIdAndEndedAtIsNull(userId)
                .map(expedition -> {
                    int sightingCount = sightingRepository.findByExpeditionId(expedition.getId()).size();
                    return toResponse(expedition, sightingCount);
                });
    }

    public Page<ExpeditionResponse> getUserExpeditions(UUID userId, Pageable pageable) {
        return expeditionRepository.findByUserId(userId, pageable)
                .map(expedition -> {
                    int sightingCount = sightingRepository.findByExpeditionId(expedition.getId()).size();
                    return toResponse(expedition, sightingCount);
                });
    }

    private ExpeditionResponse toResponse(Expedition expedition, int sightingCount) {
        return ExpeditionResponse.builder()
                .id(expedition.getId())
                .startedAt(expedition.getStartedAt())
                .endedAt(expedition.getEndedAt())
                .notes(expedition.getNotes())
                .sightingCount(sightingCount)
                .createdAt(expedition.getCreatedAt())
                .build();
    }
}
