package com.zoadex.api.social;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SightingConfirmationRepository extends JpaRepository<SightingConfirmation, UUID> {
    boolean existsBySightingIdAndUserId(UUID sightingId, UUID userId);
    long countBySightingId(UUID sightingId);
    Optional<SightingConfirmation> findBySightingIdAndUserId(UUID sightingId, UUID userId);
}
