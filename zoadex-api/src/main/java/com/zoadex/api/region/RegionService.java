package com.zoadex.api.region;

import com.zoadex.api.common.exception.ResourceNotFoundException;
import com.zoadex.api.region.dto.CategoryProgress;
import com.zoadex.api.region.dto.ChecklistResponse;
import com.zoadex.api.region.dto.RegionResponse;
import com.zoadex.api.region.dto.SpeciesSummaryResponse;
import com.zoadex.api.sighting.Sighting;
import com.zoadex.api.sighting.SightingRepository;
import com.zoadex.api.species.Species;
import com.zoadex.api.species.SpeciesCategory;
import com.zoadex.api.species.SpeciesImage;
import com.zoadex.api.species.SpeciesImageRepository;
import com.zoadex.api.species.SpeciesOccurrenceRepository;
import com.zoadex.api.species.SpeciesRepository;
import com.zoadex.api.species.dto.SpeciesResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RegionService {

    private final RegionRepository regionRepository;
    private final RegionSpeciesRepository regionSpeciesRepository;
    private final SpeciesRepository speciesRepository;
    private final SpeciesImageRepository speciesImageRepository;
    private final SightingRepository sightingRepository;
    private final SpeciesOccurrenceRepository occurrenceRepository;

    public List<RegionResponse> getAllRegions() {
        Set<UUID> regionsWithGps = new HashSet<>(occurrenceRepository.findDistinctRegionIdsWithOccurrences());
        return regionRepository.findAll().stream()
                .map(region -> toResponse(region, regionsWithGps))
                .collect(Collectors.toList());
    }

    public List<RegionResponse> getRegionsByContinent(String continent) {
        Set<UUID> regionsWithGps = new HashSet<>(occurrenceRepository.findDistinctRegionIdsWithOccurrences());
        return regionRepository.findByContinent(continent).stream()
                .map(region -> toResponse(region, regionsWithGps))
                .toList();
    }

    public RegionResponse getRegionById(UUID id) {
        Region region = regionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Region", "id", id));
        boolean hasGps = occurrenceRepository.existsByRegionId(region.getId());
        return toResponse(region, hasGps);
    }

    public Page<SpeciesResponse> getRegionSpecies(UUID regionId, SpeciesCategory category, Pageable pageable) {
        regionRepository.findById(regionId)
                .orElseThrow(() -> new ResourceNotFoundException("Region", "id", regionId));

        Page<Species> species;
        if (category != null) {
            species = speciesRepository.findByRegionIdAndCategory(regionId, category, pageable);
        } else {
            species = speciesRepository.findByRegionId(regionId, pageable);
        }
        return species.map(this::toSpeciesResponse);
    }

    /**
     * Get region checklist with per-category progress for the user.
     */
    public ChecklistResponse getRegionChecklist(UUID regionId, UUID userId) {
        Region region = regionRepository.findById(regionId)
                .orElseThrow(() -> new ResourceNotFoundException("Region", "id", regionId));

        // Get all species in this region
        List<RegionSpecies> regionSpeciesList = regionSpeciesRepository.findByRegionId(regionId);
        Set<UUID> regionSpeciesIds = regionSpeciesList.stream()
                .map(RegionSpecies::getSpeciesId)
                .collect(Collectors.toSet());

        // Get user's discovered species (first sightings)
        Set<UUID> discoveredSpeciesIds = sightingRepository.findByUserId(userId, Pageable.unpaged())
                .getContent().stream()
                .filter(Sighting::getIsFirstDiscovery)
                .map(Sighting::getSpeciesId)
                .filter(regionSpeciesIds::contains)
                .collect(Collectors.toSet());

        // Build per-category progress
        List<CategoryProgress> categoryProgressList = Arrays.stream(SpeciesCategory.values())
                .map(category -> {
                    long total = regionSpeciesIds.stream()
                            .map(id -> speciesRepository.findById(id).orElse(null))
                            .filter(s -> s != null && s.getCategory() == category)
                            .count();

                    long discovered = discoveredSpeciesIds.stream()
                            .map(id -> speciesRepository.findById(id).orElse(null))
                            .filter(s -> s != null && s.getCategory() == category)
                            .count();

                    double percentage = total > 0 ? (double) discovered / total * 100.0 : 0.0;

                    return CategoryProgress.builder()
                            .category(category)
                            .totalSpecies((int) total)
                            .discoveredSpecies((int) discovered)
                            .percentComplete(Math.round(percentage * 10.0) / 10.0)
                            .build();
                })
                .filter(cp -> cp.getTotalSpecies() > 0) // Only include categories that exist in region
                .collect(Collectors.toList());

        int totalSpecies = regionSpeciesIds.size();
        int totalDiscovered = discoveredSpeciesIds.size();
        double overallProgress = totalSpecies > 0 ? (double) totalDiscovered / totalSpecies * 100.0 : 0.0;

        return ChecklistResponse.builder()
                .regionId(region.getId())
                .regionName(region.getName())
                .totalSpecies(totalSpecies)
                .discoveredSpecies(totalDiscovered)
                .overallProgress(Math.round(overallProgress * 10.0) / 10.0)
                .categories(categoryProgressList)
                .build();
    }

    /**
     * Get lightweight species summary for all species in a region (no pagination).
     * Returns only id, category, names, thumbnail, and occurrence count.
     */
    public List<SpeciesSummaryResponse> getSpeciesSummary(UUID regionId) {
        List<RegionSpecies> links = regionSpeciesRepository.findByRegionId(regionId);
        List<UUID> speciesIds = links.stream().map(RegionSpecies::getSpeciesId).toList();
        List<Species> species = speciesRepository.findAllById(speciesIds);

        // Get thumbnail URLs
        Map<UUID, String> thumbnails = speciesImageRepository.findBySpeciesIdIn(speciesIds)
                .stream()
                .collect(Collectors.toMap(
                        img -> img.getSpecies().getId(),
                        SpeciesImage::getThumbnailUrl,
                        (a, b) -> a
                ));

        // Get occurrence counts from region-species links
        Map<UUID, Integer> occCounts = links.stream()
                .collect(Collectors.toMap(
                        RegionSpecies::getSpeciesId,
                        rs -> rs.getOccurrenceCount() != null ? rs.getOccurrenceCount() : 0
                ));

        return species.stream().map(s -> SpeciesSummaryResponse.builder()
                .id(s.getId().toString())
                .commonName(s.getCommonName())
                .commonNameLocal(s.getCommonNameLocal())
                .scientificName(s.getScientificName())
                .category(s.getCategory().name())
                .thumbnailUrl(thumbnails.get(s.getId()))
                .occurrenceCount(occCounts.getOrDefault(s.getId(), 0))
                .nameIt(s.getNameIt())
                .nameFr(s.getNameFr())
                .nameEs(s.getNameEs())
                .nameDe(s.getNameDe())
                .nameZh(s.getNameZh())
                .nameAr(s.getNameAr())
                .nameJa(s.getNameJa())
                .build()
        ).toList();
    }

    private RegionResponse toResponse(Region region, Set<UUID> regionsWithGps) {
        return toResponse(region, regionsWithGps.contains(region.getId()));
    }

    private RegionResponse toResponse(Region region, boolean hasGpsData) {
        Double centerLat = null;
        Double centerLon = null;
        if (region.getBoundary() != null) {
            org.locationtech.jts.geom.Point centroid = region.getBoundary().getCentroid();
            centerLat = centroid.getY();
            centerLon = centroid.getX();
        }

        int speciesCount = region.getSpeciesCount() != null ? region.getSpeciesCount() : 0;
        String dataTier;
        if (speciesCount == 0) {
            dataTier = "MISSING";
        } else if (speciesCount <= 250) {
            dataTier = "PARTIAL";
        } else if (speciesCount <= 1100) {
            dataTier = "BASIC";
        } else {
            dataTier = "FULL";
        }

        return RegionResponse.builder()
                .id(region.getId())
                .name(region.getName())
                .description(region.getDescription())
                .country(region.getCountry())
                .continent(region.getContinent())
                .adminLevel(region.getAdminLevel())
                .speciesCount(region.getSpeciesCount())
                .lastSynced(region.getLastSynced())
                .centerLatitude(centerLat)
                .centerLongitude(centerLon)
                .dataTier(dataTier)
                .hasGpsData(hasGpsData)
                .build();
    }

    private SpeciesResponse toSpeciesResponse(Species species) {
        return SpeciesResponse.builder()
                .id(species.getId())
                .gbifKey(species.getGbifKey())
                .scientificName(species.getScientificName())
                .commonName(species.getCommonName())
                .commonNameLocal(species.getCommonNameLocal())
                .category(species.getCategory())
                .taxonomyClass(species.getTaxonomyClass())
                .taxonomyOrder(species.getTaxonomyOrder())
                .taxonomyFamily(species.getTaxonomyFamily())
                .iucnStatus(species.getIucnStatus())
                .build();
    }
}
