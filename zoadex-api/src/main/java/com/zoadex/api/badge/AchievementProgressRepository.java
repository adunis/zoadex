package com.zoadex.api.badge;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AchievementProgressRepository extends JpaRepository<AchievementProgress, UUID> {

    List<AchievementProgress> findByUserId(UUID userId);

    Optional<AchievementProgress> findByUserIdAndBadgeId(UUID userId, UUID badgeId);
}
