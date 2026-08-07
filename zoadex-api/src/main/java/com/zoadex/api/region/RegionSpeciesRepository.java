package com.zoadex.api.region;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RegionSpeciesRepository extends JpaRepository<RegionSpecies, RegionSpecies.RegionSpeciesId> {

    List<RegionSpecies> findByRegionId(UUID regionId);

    List<RegionSpecies> findBySpeciesId(UUID speciesId);

    long countByRegionId(UUID regionId);

    @Query(value = "SELECT rs.species_id FROM region_species rs " +
            "WHERE rs.region_id = :regionId " +
            "AND rs.species_id NOT IN (SELECT DISTINCT so.species_id FROM species_occurrences so WHERE so.region_id = :regionId) " +
            "LIMIT :maxSpecies", nativeQuery = true)
    List<UUID> findSpeciesIdsWithoutOccurrences(@Param("regionId") UUID regionId, @Param("maxSpecies") int maxSpecies);
}

