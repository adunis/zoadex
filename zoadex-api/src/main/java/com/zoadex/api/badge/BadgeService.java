package com.zoadex.api.badge;

import com.zoadex.api.badge.dto.BadgeProgressResponse;
import com.zoadex.api.badge.dto.BadgeResponse;
import com.zoadex.api.badge.dto.UserBadgeResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BadgeService {

    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final AchievementProgressRepository achievementProgressRepository;

    public List<BadgeResponse> getAllBadges() {
        return badgeRepository.findAll().stream()
                .map(this::toBadgeResponse)
                .collect(Collectors.toList());
    }

    public List<UserBadgeResponse> getUserBadges(UUID userId) {
        return userBadgeRepository.findByUserId(userId).stream()
                .map(userBadge -> {
                    Badge badge = badgeRepository.findById(userBadge.getBadgeId()).orElse(null);
                    return toUserBadgeResponse(userBadge, badge);
                })
                .collect(Collectors.toList());
    }

    public List<BadgeProgressResponse> getUserProgress(UUID userId) {
        return achievementProgressRepository.findByUserId(userId).stream()
                .map(progress -> {
                    Badge badge = badgeRepository.findById(progress.getBadgeId()).orElse(null);
                    return toBadgeProgressResponse(progress, badge);
                })
                .collect(Collectors.toList());
    }

    private BadgeResponse toBadgeResponse(Badge badge) {
        return BadgeResponse.builder()
                .id(badge.getId())
                .name(badge.getName())
                .description(badge.getDescription())
                .iconUrl(badge.getIconUrl())
                .category(badge.getCategory())
                .tier(badge.getTier())
                .criteria(badge.getCriteria())
                .build();
    }

    private UserBadgeResponse toUserBadgeResponse(UserBadge userBadge, Badge badge) {
        return UserBadgeResponse.builder()
                .badgeId(userBadge.getBadgeId())
                .badgeName(badge != null ? badge.getName() : null)
                .badgeDescription(badge != null ? badge.getDescription() : null)
                .badgeIconUrl(badge != null ? badge.getIconUrl() : null)
                .category(badge != null ? badge.getCategory() : null)
                .tier(badge != null ? badge.getTier() : null)
                .unlockedAt(userBadge.getUnlockedAt())
                .build();
    }

    private BadgeProgressResponse toBadgeProgressResponse(AchievementProgress progress, Badge badge) {
        double percent = progress.getTarget() > 0
                ? (double) progress.getCurrentProgress() / progress.getTarget() * 100.0
                : 0.0;

        return BadgeProgressResponse.builder()
                .badgeId(progress.getBadgeId())
                .badgeName(badge != null ? badge.getName() : null)
                .tier(badge != null ? badge.getTier() : null)
                .currentProgress(progress.getCurrentProgress())
                .target(progress.getTarget())
                .percentComplete(percent)
                .build();
    }
}
