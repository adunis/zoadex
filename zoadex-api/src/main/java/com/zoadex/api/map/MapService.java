package com.zoadex.api.map;

import com.zoadex.api.map.dto.HeatmapPoint;
import com.zoadex.api.map.dto.OccurrencePointResponse;
import com.zoadex.api.map.dto.SightingPin;
import com.zoadex.api.region.RegionSpecies;
import com.zoadex.api.region.RegionSpeciesRepository;
import com.zoadex.api.sighting.Sighting;
import com.zoadex.api.sighting.SightingRepository;
import com.zoadex.api.species.Species;
import com.zoadex.api.species.SpeciesCategory;
import com.zoadex.api.species.SpeciesOccurrence;
import com.zoadex.api.species.SpeciesOccurrenceRepository;
import com.zoadex.api.species.SpeciesRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MapService {

    private final SpeciesOccurrenceRepository occurrenceRepository;
    private final SightingRepository sightingRepository;
    private final SpeciesRepository speciesRepository;
    private final RegionSpeciesRepository regionSpeciesRepository;

    private static final double GRID_SIZE = 0.01; // ~1km grid cells for heatmap
    private static final double CLUSTER_GRID_SIZE = 0.018; // ~2km grid cells for MegaSighting clusters

    /**
     * Get heatmap data aggregated by grid cells within a bounding box.
     * Optionally filter by month.
     */
    public List<HeatmapPoint> getHeatmapData(UUID regionId, Double minLat, Double minLon,
                                             Double maxLat, Double maxLon, Integer month) {
        List<SpeciesOccurrence> occurrences;
        if (month != null) {
            occurrences = occurrenceRepository.findByRegionIdAndMonth(regionId, month.shortValue());
        } else {
            occurrences = occurrenceRepository.findByRegionId(regionId);
        }

        // Aggregate by grid cell
        Map<String, GridCell> gridCells = new HashMap<>();

        for (SpeciesOccurrence occ : occurrences) {
            if (occ.getLocation() == null) continue;

            double lat = occ.getLocation().getY();
            double lon = occ.getLocation().getX();

            // Filter by bounding box if provided
            if (minLat != null && maxLat != null && minLon != null && maxLon != null) {
                if (lat < minLat || lat > maxLat || lon < minLon || lon > maxLon) {
                    continue;
                }
            }

            // Round to grid cell
            double gridLat = Math.floor(lat / GRID_SIZE) * GRID_SIZE + GRID_SIZE / 2;
            double gridLon = Math.floor(lon / GRID_SIZE) * GRID_SIZE + GRID_SIZE / 2;
            String key = gridLat + ":" + gridLon;

            gridCells.computeIfAbsent(key, k -> new GridCell(gridLat, gridLon))
                    .addOccurrence(occ);
        }

        return gridCells.values().stream()
                .map(cell -> HeatmapPoint.builder()
                        .latitude(cell.lat)
                        .longitude(cell.lon)
                        .intensity(cell.totalCount)
                        .speciesId(cell.dominantSpeciesId)
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * Get user sighting pins within a bounding box.
     */
    public List<SightingPin> getUserSightingPins(UUID userId, Double minLat, Double minLon,
                                                 Double maxLat, Double maxLon) {
        List<Sighting> sightings = sightingRepository.findByUserId(userId, Pageable.unpaged()).getContent();

        return sightings.stream()
                .filter(s -> s.getLocation() != null)
                .filter(s -> {
                    if (minLat == null || maxLat == null || minLon == null || maxLon == null) {
                        return true;
                    }
                    double lat = s.getLocation().getY();
                    double lon = s.getLocation().getX();
                    return lat >= minLat && lat <= maxLat && lon >= minLon && lon <= maxLon;
                })
                .map(s -> {
                    Species species = speciesRepository.findById(s.getSpeciesId()).orElse(null);
                    return SightingPin.builder()
                            .sightingId(s.getId())
                            .speciesId(s.getSpeciesId())
                            .speciesName(species != null ? species.getCommonName() : null)
                            .latitude(s.getLocation().getY())
                            .longitude(s.getLocation().getX())
                            .sightedAt(s.getSightedAt())
                            .build();
                })
                .collect(Collectors.toList());
    }

    /**
     * Returns clustered occurrence hotspots per species (MegaSightings).
     * Groups occurrence points within a ~2km grid cell per species.
     * Returns one point per species per grid cell with count, sorted by cluster size descending.
     * Accepts one or more category names; if none provided, all region species are included.
     */
    public List<OccurrencePointResponse> getOccurrencePoints(UUID regionId, List<String> categories, int limit) {
        List<UUID> speciesIds = getSpeciesIdsForCategories(regionId, categories);
        if (speciesIds.isEmpty()) return List.of();

        // Fetch all occurrences for the filtered species for clustering
        List<SpeciesOccurrence> rawOccurrences = occurrenceRepository
                .findByRegionIdAndSpeciesIdIn(regionId, speciesIds);

        // Cluster by species + grid cell (~2km cells)
        Map<String, ClusterAccumulator> clusters = new HashMap<>();
        for (SpeciesOccurrence occ : rawOccurrences) {
            if (occ.getLocation() == null) continue;
            double lat = occ.getLocation().getY();
            double lon = occ.getLocation().getX();
            double gridLat = Math.round(lat / CLUSTER_GRID_SIZE) * CLUSTER_GRID_SIZE;
            double gridLon = Math.round(lon / CLUSTER_GRID_SIZE) * CLUSTER_GRID_SIZE;
            String key = occ.getSpeciesId() + "|" + gridLat + "|" + gridLon;

            clusters.computeIfAbsent(key, k -> new ClusterAccumulator(
                    occ.getSpeciesId().toString(), gridLat, gridLon
            )).addPoint(lat, lon);
        }

        // Fetch total occurrence counts per species from region_species
        Map<UUID, Integer> occCounts = getOccurrenceCountMap(regionId, speciesIds);

        return clusters.values().stream()
                .sorted(Comparator.comparingInt(ClusterAccumulator::getCount).reversed())
                .limit(limit)
                .map(c -> OccurrencePointResponse.builder()
                        .speciesId(c.speciesId)
                        .latitude(c.getCentroidLat())
                        .longitude(c.getCentroidLon())
                        .clusterSize(c.getCount())
                        .radiusKm(2.0)
                        .occurrenceCount(occCounts.getOrDefault(UUID.fromString(c.speciesId), 0))
                        .build())
                .toList();
    }

    private List<UUID> getSpeciesIdsForCategories(UUID regionId, List<String> categories) {
        if (categories != null && !categories.isEmpty()) {
            List<UUID> ids = new ArrayList<>();
            for (String category : categories) {
                try {
                    ids.addAll(
                        speciesRepository.findByCategory(SpeciesCategory.valueOf(category))
                            .stream().map(Species::getId).toList()
                    );
                } catch (IllegalArgumentException ignored) {
                    // Skip unknown category values
                }
            }
            return ids;
        }
        return regionSpeciesRepository.findByRegionId(regionId)
                .stream().map(RegionSpecies::getSpeciesId).toList();
    }

    private Map<UUID, Integer> getOccurrenceCountMap(UUID regionId, List<UUID> speciesIds) {
        return regionSpeciesRepository.findByRegionId(regionId).stream()
                .filter(rs -> speciesIds.contains(rs.getSpeciesId()))
                .collect(Collectors.toMap(
                        RegionSpecies::getSpeciesId,
                        rs -> rs.getOccurrenceCount() != null ? rs.getOccurrenceCount() : 0
                ));
    }

    // -------------------------------------------------------------------------
    // Inner classes
    // -------------------------------------------------------------------------

    private static class GridCell {
        final double lat;
        final double lon;
        int totalCount;
        UUID dominantSpeciesId;
        int dominantCount;
        final Map<UUID, Integer> speciesCounts = new HashMap<>();

        GridCell(double lat, double lon) {
            this.lat = lat;
            this.lon = lon;
        }

        void addOccurrence(SpeciesOccurrence occ) {
            int count = occ.getOccurrenceCount() != null ? occ.getOccurrenceCount() : 1;
            totalCount += count;

            int speciesTotal = speciesCounts.merge(occ.getSpeciesId(), count, Integer::sum);
            if (speciesTotal > dominantCount) {
                dominantCount = speciesTotal;
                dominantSpeciesId = occ.getSpeciesId();
            }
        }
    }

    /**
     * Accumulates raw occurrence points into a single cluster.
     * Tracks centroid via running sums and total point count.
     */
    private static class ClusterAccumulator {
        final String speciesId;
        final double gridLat;
        final double gridLon;
        private double sumLat = 0;
        private double sumLon = 0;
        private int count = 0;

        ClusterAccumulator(String speciesId, double gridLat, double gridLon) {
            this.speciesId = speciesId;
            this.gridLat = gridLat;
            this.gridLon = gridLon;
        }

        void addPoint(double lat, double lon) {
            sumLat += lat;
            sumLon += lon;
            count++;
        }

        double getCentroidLat() { return sumLat / count; }
        double getCentroidLon() { return sumLon / count; }
        int getCount() { return count; }
    }
}
