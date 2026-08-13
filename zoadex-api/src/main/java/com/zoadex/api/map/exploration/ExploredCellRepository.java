package com.zoadex.api.map.exploration;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ExploredCellRepository extends JpaRepository<ExploredCell, UUID> {

    List<ExploredCell> findByUserIdAndRegionId(UUID userId, UUID regionId);

    List<ExploredCell> findByUserId(UUID userId);

    boolean existsByUserIdAndRegionIdAndCellXAndCellYAndZoomLevel(
            UUID userId, UUID regionId, int cellX, int cellY, int zoomLevel);

    @Modifying
    @Query("DELETE FROM ExploredCell e WHERE e.userId = :userId AND e.regionId = :regionId AND e.cellX = :cellX AND e.cellY = :cellY AND e.zoomLevel = :zoomLevel")
    void deleteCell(@Param("userId") UUID userId, @Param("regionId") UUID regionId,
                    @Param("cellX") int cellX, @Param("cellY") int cellY, @Param("zoomLevel") int zoomLevel);

    long countByUserIdAndRegionId(UUID userId, UUID regionId);
}
