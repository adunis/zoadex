package com.zoadex.api.region;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RegionRepository extends JpaRepository<Region, UUID> {

    List<Region> findByCountry(String country);

    List<Region> findByContinent(String continent);

    List<Region> findByNameContainingIgnoreCase(String name);

    @Query(value = "SELECT ST_Contains(r.boundary::geometry, ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)) FROM regions r WHERE r.id = :regionId", nativeQuery = true)
    boolean isPointWithinRegion(@Param("regionId") UUID regionId, @Param("latitude") double latitude, @Param("longitude") double longitude);

    @Query(value = "SELECT ST_Y(geom) as lat, ST_X(geom) as lng FROM " +
            "(SELECT (ST_DumpPoints(boundary::geometry)).geom FROM regions WHERE id = :regionId) pts",
            nativeQuery = true)
    List<Object[]> getBoundaryPoints(@Param("regionId") UUID regionId);
}
