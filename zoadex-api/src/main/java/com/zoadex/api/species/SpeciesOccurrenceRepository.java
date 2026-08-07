package com.zoadex.api.species;

import com.zoadex.api.suggestion.TimeBucket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SpeciesOccurrenceRepository extends JpaRepository<SpeciesOccurrence, UUID> {

    List<SpeciesOccurrence> findByRegionId(UUID regionId);

    List<SpeciesOccurrence> findByRegionIdAndMonth(UUID regionId, Short month);

    List<SpeciesOccurrence> findByRegionIdAndMonthAndTimeBucket(UUID regionId, Short month, TimeBucket timeBucket);

    List<SpeciesOccurrence> findBySpeciesIdAndRegionId(UUID speciesId, UUID regionId);

    List<SpeciesOccurrence> findBySpeciesId(UUID speciesId);

    @Query("SELECT so FROM SpeciesOccurrence so WHERE so.regionId = :regionId AND so.speciesId IN :speciesIds")
    List<SpeciesOccurrence> findByRegionIdAndSpeciesIdIn(
            @Param("regionId") UUID regionId,
            @Param("speciesIds") List<UUID> speciesIds);

    @Query("SELECT DISTINCT so.regionId FROM SpeciesOccurrence so")
    List<UUID> findDistinctRegionIdsWithOccurrences();

    boolean existsByRegionId(UUID regionId);
}

