package com.zoadex.api.map.exploration;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MapNoteRepository extends JpaRepository<MapNote, UUID> {

    List<MapNote> findByUserIdAndRegionIdOrderByCreatedAtDesc(UUID userId, UUID regionId);

    List<MapNote> findByUserId(UUID userId);

    long countByUserIdAndRegionId(UUID userId, UUID regionId);
}
