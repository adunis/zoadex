package com.zoadex.api.user;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface UserRegionRepository extends JpaRepository<UserRegion, UserRegionId> {

    List<UserRegion> findByUserId(UUID userId);

    boolean existsByUserIdAndRegionId(UUID userId, UUID regionId);

    long countByUserId(UUID userId);
}
