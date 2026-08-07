package com.zoadex.api.sighting;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SightingRepository extends JpaRepository<Sighting, UUID> {

    Page<Sighting> findByUserId(UUID userId, Pageable pageable);

    List<Sighting> findByUserIdAndSpeciesId(UUID userId, UUID speciesId);

    List<Sighting> findByExpeditionId(UUID expeditionId);

    long countByUserId(UUID userId);

    long countByUserIdAndIsFirstDiscoveryTrue(UUID userId);
}
