package com.zoadex.api.sighting;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    @Query("SELECT s FROM Sighting s WHERE s.userId IN " +
           "(SELECT u.id FROM User u WHERE u.activeRegion.id = :regionId) " +
           "ORDER BY s.sightedAt DESC")
    List<Sighting> findRecentByRegion(@Param("regionId") UUID regionId, Pageable pageable);
}
