package com.zoadex.api.species;

import com.zoadex.api.common.exception.ResourceNotFoundException;
import com.zoadex.api.region.RegionSpecies;
import com.zoadex.api.region.RegionSpeciesRepository;
import com.zoadex.api.species.dto.SpeciesImageResponse;
import com.zoadex.api.species.dto.SpeciesResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SpeciesService {

    private final SpeciesRepository speciesRepository;
    private final SpeciesImageRepository speciesImageRepository;
    private final RegionSpeciesRepository regionSpeciesRepository;

    public Page<SpeciesResponse> getSpeciesByRegion(UUID regionId, SpeciesCategory category, Pageable pageable) {
        // Build occurrence count lookup from region_species table
        Map<UUID, Integer> occurrenceCounts = regionSpeciesRepository.findByRegionId(regionId).stream()
                .collect(Collectors.toMap(RegionSpecies::getSpeciesId, RegionSpecies::getOccurrenceCount));

        if (category != null) {
            return speciesRepository.findByRegionIdAndCategory(regionId, category, pageable)
                    .map(species -> toResponseWithCount(species, occurrenceCounts));
        }
        return speciesRepository.findByRegionId(regionId, pageable)
                .map(species -> toResponseWithCount(species, occurrenceCounts));
    }

    public SpeciesResponse getSpeciesById(UUID id) {
        Species species = speciesRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Species", "id", id));

        List<SpeciesImageResponse> images = speciesImageRepository.findBySpeciesId(id).stream()
                .map(this::toImageResponse)
                .collect(Collectors.toList());

        SpeciesResponse response = toResponse(species);
        response.setImages(images);
        return response;
    }

    public Page<SpeciesResponse> search(String query, Pageable pageable) {
        if (query == null || query.isBlank()) {
            return speciesRepository.findAll(pageable).map(this::toResponse);
        }
        return speciesRepository.search(query, pageable)
                .map(this::toResponse);
    }

    public List<SpeciesResponse> searchGlobal(String query, Pageable pageable) {
        if (query == null || query.isBlank()) {
            return List.of();
        }
        List<Species> results = speciesRepository
                .findByCommonNameContainingIgnoreCaseOrScientificNameContainingIgnoreCase(query, query, pageable);
        return results.stream().map(this::toResponse).toList();
    }

    private SpeciesResponse toResponse(Species species) {
        // Get first image if available
        List<SpeciesImage> images = speciesImageRepository.findBySpeciesId(species.getId());
        String thumbnailUrl = !images.isEmpty() ? images.getFirst().getThumbnailUrl() : null;

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
                .description(species.getDescription())
                .thumbnailUrl(thumbnailUrl)
                .build();
    }

    private SpeciesResponse toResponseWithCount(Species species, Map<UUID, Integer> occurrenceCounts) {
        SpeciesResponse response = toResponse(species);
        response.setOccurrenceCount(occurrenceCounts.getOrDefault(species.getId(), 0));
        return response;
    }

    private SpeciesImageResponse toImageResponse(SpeciesImage image) {
        return SpeciesImageResponse.builder()
                .id(image.getId())
                .source(image.getSource().name())
                .imageUrl(image.getImageUrl())
                .thumbnailUrl(image.getThumbnailUrl())
                .license(image.getLicense())
                .attribution(image.getAttribution())
                .build();
    }
}
