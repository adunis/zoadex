package com.zoadex.api.species;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SpeciesRepository extends JpaRepository<Species, UUID> {

    Optional<Species> findByGbifKey(Long gbifKey);

    List<Species> findByCategory(SpeciesCategory category);

    @Query("SELECT s FROM Species s JOIN RegionSpecies rs ON s.id = rs.speciesId WHERE rs.regionId = :regionId")
    Page<Species> findByRegionId(@Param("regionId") UUID regionId, Pageable pageable);

    @Query("SELECT s FROM Species s JOIN RegionSpecies rs ON s.id = rs.speciesId " +
            "WHERE rs.regionId = :regionId AND s.category = :category")
    Page<Species> findByRegionIdAndCategory(@Param("regionId") UUID regionId,
                                            @Param("category") SpeciesCategory category,
                                            Pageable pageable);

    @Query("SELECT s FROM Species s WHERE LOWER(s.commonName) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(s.scientificName) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Species> search(@Param("query") String query, Pageable pageable);

    @Query(value = "SELECT s.* FROM species s " +
                   "JOIN region_species rs ON rs.species_id = s.id " +
                   "WHERE rs.region_id = :regionId " +
                   "AND s.common_name_local IS NULL " +
                   "AND s.gbif_key IS NOT NULL " +
                   "LIMIT :limit", nativeQuery = true)
    List<Species> findByRegionWithoutLocalName(@Param("regionId") UUID regionId, @Param("limit") int limit);

    @Query(value = "SELECT s.* FROM species s " +
                   "JOIN region_species rs ON rs.species_id = s.id " +
                   "WHERE rs.region_id = :regionId " +
                   "AND s.name_it IS NULL " +
                   "AND s.name_fr IS NULL " +
                   "AND s.gbif_key IS NOT NULL " +
                   "LIMIT :limit", nativeQuery = true)
    List<Species> findByRegionWithoutNames(@Param("regionId") UUID regionId, @Param("limit") int limit);
}
