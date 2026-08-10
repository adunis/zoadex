package com.zoadex.api.xp;

import com.zoadex.api.sighting.Sighting;
import com.zoadex.api.region.RegionSpecies;
import com.zoadex.api.region.RegionSpeciesRepository;
import com.zoadex.api.user.User;
import com.zoadex.api.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class XpService {

    private final XpEventRepository xpEventRepository;
    private final UserRepository userRepository;
    private final RegionSpeciesRepository regionSpeciesRepository;

    // XP rewards
    private static final int XP_SIGHTING = 10;
    private static final int XP_FIRST_DISCOVERY = 50;
    private static final int XP_RARE_SPECIES = 25;
    private static final int XP_LEGENDARY_SPECIES = 100;
    private static final int XP_PHOTO_BONUS = 5;
    private static final int XP_NEW_REGION = 75;
    private static final int XP_BADGE_EARNED = 100;
    private static final int XP_DAILY_STREAK_BONUS = 20;
    private static final int XP_EXPEDITION_COMPLETE = 50;

    // Level thresholds: level N requires N*100 total XP (so level 2=200, level 10=1000, level 50=5000)
    public static int xpForLevel(int level) {
        return level * 100;
    }

    public static int levelForXp(int xp) {
        // Level = floor(xp / 100) + 1, minimum level 1
        return Math.max(1, (xp / 100) + 1);
    }

    @Transactional
    public XpGainResult awardSightingXp(UUID userId, Sighting sighting) {
        int totalXp = 0;
        StringBuilder desc = new StringBuilder();

        // Base sighting XP
        totalXp += XP_SIGHTING;
        desc.append("Sighting logged");

        // First discovery bonus
        if (Boolean.TRUE.equals(sighting.getIsFirstDiscovery())) {
            totalXp += XP_FIRST_DISCOVERY;
            desc.append(" + First discovery!");
        }

        // Photo bonus
        if (sighting.getPhotoUrl() != null && !sighting.getPhotoUrl().isBlank()) {
            totalXp += XP_PHOTO_BONUS;
            desc.append(" + Photo");
        }

        // Rarity bonus (check occurrence count in region_species)
        var regionSpecies = regionSpeciesRepository.findBySpeciesId(sighting.getSpeciesId());
        if (!regionSpecies.isEmpty()) {
            // Use min occurrence count across regions as rarity indicator
            long minOccurrences = regionSpecies.stream()
                    .mapToLong(rs -> rs.getOccurrenceCount() != null ? rs.getOccurrenceCount() : 0)
                    .min().orElse(0);
            if (minOccurrences <= 10) {
                totalXp += XP_LEGENDARY_SPECIES;
                desc.append(" + Legendary species!");
            } else if (minOccurrences <= 100) {
                totalXp += XP_RARE_SPECIES;
                desc.append(" + Rare species");
            }
        }

        return awardXp(userId, totalXp, "SIGHTING", desc.toString(), sighting.getId());
    }

    @Transactional
    public XpGainResult awardRegionUnlockXp(UUID userId, UUID regionId) {
        return awardXp(userId, XP_NEW_REGION, "REGION_UNLOCK", "New region unlocked", regionId);
    }

    @Transactional
    public XpGainResult awardBadgeXp(UUID userId, UUID badgeId, String badgeName) {
        return awardXp(userId, XP_BADGE_EARNED, "BADGE_EARNED", "Badge: " + badgeName, badgeId);
    }

    @Transactional
    public XpGainResult awardExpeditionXp(UUID userId, UUID expeditionId) {
        return awardXp(userId, XP_EXPEDITION_COMPLETE, "EXPEDITION", "Expedition completed", expeditionId);
    }

    @Transactional
    public XpGainResult awardXp(UUID userId, int amount, String reason, String description, UUID referenceId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return new XpGainResult(0, 0, 0, false);

        int oldLevel = user.getLevel();
        int newXp = user.getXp() + amount;
        int newLevel = levelForXp(newXp);

        user.setXp(newXp);
        user.setLevel(newLevel);
        userRepository.save(user);

        // Log the event
        XpEvent event = XpEvent.builder()
                .userId(userId)
                .amount(amount)
                .reason(reason)
                .description(description)
                .referenceId(referenceId)
                .build();
        xpEventRepository.save(event);

        boolean leveledUp = newLevel > oldLevel;
        if (leveledUp) {
            log.info("User {} leveled up! {} -> {} ({}xp)", userId, oldLevel, newLevel, newXp);
        }

        return new XpGainResult(amount, newXp, newLevel, leveledUp);
    }

    public XpSummary getXpSummary(UUID userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return new XpSummary(0, 1, 0, 100, List.of());

        int currentXp = user.getXp();
        int level = user.getLevel();
        int xpForCurrentLevel = xpForLevel(level - 1); // XP needed to reach current level
        int xpForNextLevel = xpForLevel(level); // XP needed to reach next level
        int xpInCurrentLevel = currentXp - xpForCurrentLevel;
        int xpNeededForNext = xpForNextLevel - xpForCurrentLevel;

        List<XpEvent> recentEvents = xpEventRepository
                .findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(0, 20));

        return new XpSummary(currentXp, level, xpInCurrentLevel, xpNeededForNext, recentEvents);
    }

    public record XpGainResult(int xpGained, int totalXp, int level, boolean leveledUp) {}

    public record XpSummary(int totalXp, int level, int xpInCurrentLevel, int xpNeededForNext, List<XpEvent> recentEvents) {}
}
