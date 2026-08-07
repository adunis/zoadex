package com.zoadex.api.badge;

import com.zoadex.api.region.RegionSpeciesRepository;
import com.zoadex.api.sighting.Sighting;
import com.zoadex.api.sighting.SightingRepository;
import com.zoadex.api.species.SpeciesRepository;
import com.zoadex.api.user.User;
import com.zoadex.api.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BadgeEvaluationServiceTest {

    @Mock
    private BadgeRepository badgeRepository;

    @Mock
    private UserBadgeRepository userBadgeRepository;

    @Mock
    private AchievementProgressRepository achievementProgressRepository;

    @Mock
    private SightingRepository sightingRepository;

    @Mock
    private SpeciesRepository speciesRepository;

    @Mock
    private RegionSpeciesRepository regionSpeciesRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private BadgeEvaluationService badgeEvaluationService;

    @Test
    void evaluateAfterSighting_awardsMilestoneBadgeAtThreshold() {
        UUID userId = UUID.randomUUID();
        UUID badgeId = UUID.randomUUID();
        UUID sightingId = UUID.randomUUID();

        Sighting sighting = Sighting.builder()
                .id(sightingId)
                .userId(userId)
                .speciesId(UUID.randomUUID())
                .sightedAt(LocalDateTime.now())
                .isFirstDiscovery(true)
                .build();

        Badge milestoneBadge = Badge.builder()
                .id(badgeId)
                .name("50 Species")
                .category("milestone")
                .criteria(Map.of("type", "MILESTONE", "count", 50))
                .build();

        when(badgeRepository.findAll()).thenReturn(List.of(milestoneBadge));
        when(userBadgeRepository.existsByUserIdAndBadgeId(userId, badgeId)).thenReturn(false);
        when(sightingRepository.countByUserIdAndIsFirstDiscoveryTrue(userId)).thenReturn(50L);
        when(achievementProgressRepository.findByUserIdAndBadgeId(userId, badgeId))
                .thenReturn(Optional.empty());
        when(achievementProgressRepository.save(any())).thenReturn(null);

        badgeEvaluationService.evaluateAfterSighting(userId, sighting);

        ArgumentCaptor<UserBadge> captor = ArgumentCaptor.forClass(UserBadge.class);
        verify(userBadgeRepository).save(captor.capture());
        assertThat(captor.getValue().getUserId()).isEqualTo(userId);
        assertThat(captor.getValue().getBadgeId()).isEqualTo(badgeId);
        assertThat(captor.getValue().getTriggeringSightingId()).isEqualTo(sightingId);
    }

    @Test
    void evaluateAfterSighting_doesNotReAwardAlreadyUnlockedBadge() {
        UUID userId = UUID.randomUUID();
        UUID badgeId = UUID.randomUUID();

        Sighting sighting = Sighting.builder()
                .id(UUID.randomUUID())
                .userId(userId)
                .speciesId(UUID.randomUUID())
                .sightedAt(LocalDateTime.now())
                .isFirstDiscovery(true)
                .build();

        Badge badge = Badge.builder()
                .id(badgeId)
                .name("Already Earned")
                .category("milestone")
                .criteria(Map.of("type", "MILESTONE", "count", 10))
                .build();

        when(badgeRepository.findAll()).thenReturn(List.of(badge));
        when(userBadgeRepository.existsByUserIdAndBadgeId(userId, badgeId)).thenReturn(true);

        badgeEvaluationService.evaluateAfterSighting(userId, sighting);

        verify(userBadgeRepository, never()).save(any(UserBadge.class));
    }

    @Test
    void evaluateAfterSighting_updatesAchievementProgress() {
        UUID userId = UUID.randomUUID();
        UUID badgeId = UUID.randomUUID();

        Sighting sighting = Sighting.builder()
                .id(UUID.randomUUID())
                .userId(userId)
                .speciesId(UUID.randomUUID())
                .sightedAt(LocalDateTime.now())
                .isFirstDiscovery(true)
                .build();

        Badge milestoneBadge = Badge.builder()
                .id(badgeId)
                .name("100 Species")
                .category("milestone")
                .criteria(Map.of("type", "MILESTONE", "count", 100))
                .build();

        AchievementProgress existingProgress = AchievementProgress.builder()
                .id(UUID.randomUUID())
                .userId(userId)
                .badgeId(badgeId)
                .currentProgress(25)
                .target(100)
                .build();

        when(badgeRepository.findAll()).thenReturn(List.of(milestoneBadge));
        when(userBadgeRepository.existsByUserIdAndBadgeId(userId, badgeId)).thenReturn(false);
        when(sightingRepository.countByUserIdAndIsFirstDiscoveryTrue(userId)).thenReturn(30L);
        when(achievementProgressRepository.findByUserIdAndBadgeId(userId, badgeId))
                .thenReturn(Optional.of(existingProgress));
        when(achievementProgressRepository.save(any())).thenReturn(null);

        badgeEvaluationService.evaluateAfterSighting(userId, sighting);

        ArgumentCaptor<AchievementProgress> captor = ArgumentCaptor.forClass(AchievementProgress.class);
        verify(achievementProgressRepository).save(captor.capture());
        assertThat(captor.getValue().getCurrentProgress()).isEqualTo(30);
        assertThat(captor.getValue().getTarget()).isEqualTo(100);
    }
}
