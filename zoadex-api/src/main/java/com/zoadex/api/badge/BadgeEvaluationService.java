package com.zoadex.api.badge;

import com.zoadex.api.region.RegionSpeciesRepository;
import com.zoadex.api.sighting.Sighting;
import com.zoadex.api.sighting.SightingRepository;
import com.zoadex.api.species.Species;
import com.zoadex.api.species.SpeciesCategory;
import com.zoadex.api.species.SpeciesRepository;
import com.zoadex.api.user.User;
import com.zoadex.api.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class BadgeEvaluationService {

    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final AchievementProgressRepository achievementProgressRepository;
    private final SightingRepository sightingRepository;
    private final SpeciesRepository speciesRepository;
    private final RegionSpeciesRepository regionSpeciesRepository;
    private final UserRepository userRepository;

    @Transactional
    public void evaluateAfterSighting(UUID userId, Sighting sighting) {
        List<Badge> allBadges = badgeRepository.findAll();

        for (Badge badge : allBadges) {
            if (userBadgeRepository.existsByUserIdAndBadgeId(userId, badge.getId())) {
                continue; // Already unlocked
            }

            boolean earned = evaluateCriteria(userId, badge, sighting);

            if (earned) {
                UserBadge userBadge = UserBadge.builder()
                        .userId(userId)
                        .badgeId(badge.getId())
                        .triggeringSightingId(sighting.getId())
                        .build();
                userBadgeRepository.save(userBadge);
                log.info("User {} unlocked badge: {}", userId, badge.getName());
            }
        }
    }

    private boolean evaluateCriteria(UUID userId, Badge badge, Sighting sighting) {
        var criteria = badge.getCriteria();
        if (criteria == null) {
            return false;
        }

        String type = (String) criteria.get("type");
        if (type == null) {
            return false;
        }

        return switch (type) {
            case "REGION_CATEGORY_COMPLETE" -> evaluateRegionCategory(userId, badge, sighting);
            case "SPECIES_SIGHTING_COUNT" -> evaluateSpeciesSightingCount(userId, badge, sighting);
            case "MILESTONE" -> evaluateMilestone(userId, badge);
            case "SIGHTINGS_WITH_PHOTO" -> evaluateSightingsWithPhoto(userId, badge);
            case "STREAK" -> evaluateStreak(userId, badge);
            // Legacy types
            case "TOTAL_SIGHTINGS" -> evaluateTotalSightings(userId, badge);
            case "FIRST_DISCOVERY" -> evaluateFirstDiscovery(userId, badge);
            default -> false;
        };
    }

    /**
     * REGION_CATEGORY_COMPLETE: checks discovered species % in a category for user's active region.
     * Criteria: { "type": "REGION_CATEGORY_COMPLETE", "category": "BIRDS", "percentage": 25 }
     */
    private boolean evaluateRegionCategory(UUID userId, Badge badge, Sighting sighting) {
        var criteria = badge.getCriteria();
        String categoryStr = (String) criteria.get("category");
        int requiredPercentage = ((Number) criteria.get("percentage")).intValue();

        if (categoryStr == null) return false;
        SpeciesCategory category = SpeciesCategory.valueOf(categoryStr);

        // Get user's active region
        User user = userRepository.findById(userId).orElse(null);
        if (user == null || user.getActiveRegion() == null) return false;
        UUID regionId = user.getActiveRegion().getId();

        // Count total species of this category in the region
        List<UUID> regionSpeciesIds = regionSpeciesRepository.findByRegionId(regionId).stream()
                .map(rs -> rs.getSpeciesId())
                .toList();

        long totalInCategory = regionSpeciesIds.stream()
                .map(id -> speciesRepository.findById(id).orElse(null))
                .filter(s -> s != null && s.getCategory() == category)
                .count();

        if (totalInCategory == 0) return false;

        // Count distinct species of this category the user has discovered (first sighting)
        long discoveredInCategory = sightingRepository.findByUserId(userId, Pageable.unpaged())
                .getContent().stream()
                .filter(Sighting::getIsFirstDiscovery)
                .map(Sighting::getSpeciesId)
                .distinct()
                .filter(speciesId -> {
                    Species sp = speciesRepository.findById(speciesId).orElse(null);
                    return sp != null && sp.getCategory() == category && regionSpeciesIds.contains(speciesId);
                })
                .count();

        int currentPercentage = (int) ((discoveredInCategory * 100) / totalInCategory);
        updateProgress(userId, badge.getId(), currentPercentage, requiredPercentage);

        return currentPercentage >= requiredPercentage;
    }

    /**
     * SPECIES_SIGHTING_COUNT: count total sightings of any single species.
     * Criteria: { "type": "SPECIES_SIGHTING_COUNT", "count": 10 }
     */
    private boolean evaluateSpeciesSightingCount(UUID userId, Badge badge, Sighting sighting) {
        var criteria = badge.getCriteria();
        int targetCount = ((Number) criteria.get("count")).intValue();

        // Check if ANY species has reached the target count for this user
        List<Sighting> speciesSightings = sightingRepository.findByUserIdAndSpeciesId(userId, sighting.getSpeciesId());
        int currentCount = speciesSightings.size();

        updateProgress(userId, badge.getId(), currentCount, targetCount);
        return currentCount >= targetCount;
    }

    /**
     * MILESTONE: total unique species discovered.
     * Criteria: { "type": "MILESTONE", "count": 50 }
     */
    private boolean evaluateMilestone(UUID userId, Badge badge) {
        var criteria = badge.getCriteria();
        int targetCount = ((Number) criteria.get("count")).intValue();

        long uniqueDiscoveries = sightingRepository.countByUserIdAndIsFirstDiscoveryTrue(userId);
        updateProgress(userId, badge.getId(), (int) uniqueDiscoveries, targetCount);
        return uniqueDiscoveries >= targetCount;
    }

    /**
     * SIGHTINGS_WITH_PHOTO: count sightings that have a photo_url.
     * Criteria: { "type": "SIGHTINGS_WITH_PHOTO", "count": 25 }
     */
    private boolean evaluateSightingsWithPhoto(UUID userId, Badge badge) {
        var criteria = badge.getCriteria();
        int targetCount = ((Number) criteria.get("count")).intValue();

        long photosCount = sightingRepository.findByUserId(userId, Pageable.unpaged())
                .getContent().stream()
                .filter(s -> s.getPhotoUrl() != null && !s.getPhotoUrl().isBlank())
                .count();

        updateProgress(userId, badge.getId(), (int) photosCount, targetCount);
        return photosCount >= targetCount;
    }

    /**
     * STREAK: count consecutive active weeks.
     * Criteria: { "type": "STREAK", "weeks": 7 }
     * Simplified: count distinct weeks where user had sightings.
     */
    private boolean evaluateStreak(UUID userId, Badge badge) {
        var criteria = badge.getCriteria();
        int targetWeeks = ((Number) criteria.get("weeks")).intValue();

        long distinctWeeks = sightingRepository.findByUserId(userId, Pageable.unpaged())
                .getContent().stream()
                .filter(s -> s.getSightedAt() != null)
                .map(s -> {
                    // Get year-week as a combined number for distinct counting
                    var date = s.getSightedAt().toLocalDate();
                    return date.getYear() * 100 + date.get(java.time.temporal.WeekFields.ISO.weekOfYear());
                })
                .distinct()
                .count();

        updateProgress(userId, badge.getId(), (int) distinctWeeks, targetWeeks);
        return distinctWeeks >= targetWeeks;
    }

    private boolean evaluateTotalSightings(UUID userId, Badge badge) {
        var criteria = badge.getCriteria();
        int target = ((Number) criteria.get("count")).intValue();
        long current = sightingRepository.countByUserId(userId);
        updateProgress(userId, badge.getId(), (int) current, target);
        return current >= target;
    }

    private boolean evaluateFirstDiscovery(UUID userId, Badge badge) {
        var criteria = badge.getCriteria();
        int target = ((Number) criteria.get("count")).intValue();
        long current = sightingRepository.countByUserIdAndIsFirstDiscoveryTrue(userId);
        updateProgress(userId, badge.getId(), (int) current, target);
        return current >= target;
    }

    private void updateProgress(UUID userId, UUID badgeId, int current, int target) {
        AchievementProgress progress = achievementProgressRepository
                .findByUserIdAndBadgeId(userId, badgeId)
                .orElse(AchievementProgress.builder()
                        .userId(userId)
                        .badgeId(badgeId)
                        .target(target)
                        .build());

        progress.setCurrentProgress(current);
        progress.setTarget(target);
        achievementProgressRepository.save(progress);
    }
}
