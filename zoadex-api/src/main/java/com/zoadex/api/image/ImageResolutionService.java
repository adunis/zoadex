package com.zoadex.api.image;

import com.fasterxml.jackson.databind.JsonNode;
import com.zoadex.api.region.RegionSpecies;
import com.zoadex.api.region.RegionSpeciesRepository;
import com.zoadex.api.species.Species;
import com.zoadex.api.species.SpeciesCategory;
import com.zoadex.api.species.SpeciesImage;
import com.zoadex.api.species.SpeciesImageRepository;
import com.zoadex.api.species.SpeciesRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ImageResolutionService {

    private final RestClient restClient;
    private final SpeciesImageRepository speciesImageRepository;
    private final SpeciesRepository speciesRepository;
    private final RegionSpeciesRepository regionSpeciesRepository;

    @Value("${zoadex.wikimedia.base-url}")
    private String wikimediaBaseUrl;

    @Value("${zoadex.inaturalist.base-url}")
    private String inaturalistBaseUrl;

    private static final Map<SpeciesCategory, String> PLACEHOLDER_URLS = Map.of(
            SpeciesCategory.BIRDS, "https://via.placeholder.com/400x300/87CEEB/000?text=Bird",
            SpeciesCategory.MAMMALS, "https://via.placeholder.com/400x300/DEB887/000?text=Mammal",
            SpeciesCategory.REPTILES, "https://via.placeholder.com/400x300/8FBC8F/000?text=Reptile",
            SpeciesCategory.AMPHIBIANS, "https://via.placeholder.com/400x300/5F9EA0/000?text=Amphibian",
            SpeciesCategory.FISH, "https://via.placeholder.com/400x300/4682B4/000?text=Fish",
            SpeciesCategory.INVERTEBRATES, "https://via.placeholder.com/400x300/DAA520/000?text=Invertebrate",
            SpeciesCategory.MUSHROOMS, "https://via.placeholder.com/400x300/CD853F/000?text=Mushroom",
            SpeciesCategory.TREES, "https://via.placeholder.com/400x300/228B22/000?text=Tree",
            SpeciesCategory.PLANTS, "https://via.placeholder.com/400x300/32CD32/000?text=Plant"
    );

    /**
     * Resolves an image for the given species using the pipeline:
     * Wikipedia → iNaturalist → Placeholder
     */
    @Transactional
    public SpeciesImage resolveImageForSpecies(Species species) {
        // Check if already has image
        List<SpeciesImage> existing = speciesImageRepository.findBySpeciesId(species.getId());
        if (!existing.isEmpty()) {
            return existing.getFirst();
        }

        // 1. Try Wikipedia
        ImageResult result = tryWikipedia(species.getScientificName());

        // 2. Try iNaturalist
        if (result == null) {
            result = tryINaturalist(species.getScientificName());
        }

        // 3. Fallback to placeholder
        if (result == null) {
            String placeholderUrl = PLACEHOLDER_URLS.getOrDefault(
                    species.getCategory(), "https://via.placeholder.com/400x300/808080/000?text=Species");
            result = new ImageResult(placeholderUrl, placeholderUrl, ImageSource.PLACEHOLDER, null, null);
        }

        SpeciesImage image = SpeciesImage.builder()
                .species(species)
                .source(result.source())
                .imageUrl(result.imageUrl())
                .thumbnailUrl(result.thumbnailUrl())
                .license(result.license())
                .attribution(result.attribution())
                .build();

        return speciesImageRepository.save(image);
    }

    /**
     * Batch resolve images for all species in a region that don't have images yet.
     * Each image resolution is independent — failures are logged and skipped.
     */
    public int resolveImagesForRegion(UUID regionId) {
        List<RegionSpecies> regionSpeciesList = regionSpeciesRepository.findByRegionId(regionId);
        int resolved = 0;

        for (RegionSpecies rs : regionSpeciesList) {
            List<SpeciesImage> existingImages = speciesImageRepository.findBySpeciesId(rs.getSpeciesId());
            if (!existingImages.isEmpty()) {
                continue;
            }

            Species species = speciesRepository.findById(rs.getSpeciesId()).orElse(null);
            if (species == null) {
                continue;
            }

            try {
                resolveImageForSpecies(species);
                resolved++;
                // Rate limit - be polite to external APIs
                Thread.sleep(500);
            } catch (Exception e) {
                log.warn("Failed to resolve image for species '{}': {}",
                        species.getScientificName(), e.getMessage());
            }
        }

        log.info("Resolved images for {} species in region {}", resolved, regionId);
        return resolved;
    }

    private ImageResult tryWikipedia(String scientificName) {
        try {
            String encodedName = URLEncoder.encode(scientificName.replace(' ', '_'), StandardCharsets.UTF_8);
            String url = wikimediaBaseUrl + "?action=query&titles=" + encodedName
                    + "&prop=pageimages&format=json&pithumbsize=400";

            JsonNode response = restClient.get()
                    .uri(url)
                    .retrieve()
                    .body(JsonNode.class);

            if (response == null || !response.has("query")) {
                return null;
            }

            JsonNode pages = response.get("query").get("pages");
            if (pages == null) {
                return null;
            }

            for (JsonNode page : pages) {
                if (page.has("thumbnail") && page.get("thumbnail").has("source")) {
                    String imageUrl = page.get("thumbnail").get("source").asText();
                    // Try to get the original image
                    String originalUrl = page.has("original") && page.get("original").has("source")
                            ? page.get("original").get("source").asText()
                            : imageUrl;

                    return new ImageResult(
                            originalUrl,
                            imageUrl,
                            ImageSource.WIKIMEDIA,
                            "CC BY-SA",
                            "Wikimedia Commons"
                    );
                }
            }
            return null;
        } catch (Exception e) {
            log.debug("Wikipedia image lookup failed for '{}': {}", scientificName, e.getMessage());
            return null;
        }
    }

    private ImageResult tryINaturalist(String scientificName) {
        try {
            String encodedName = URLEncoder.encode(scientificName, StandardCharsets.UTF_8);
            String url = inaturalistBaseUrl + "/taxa?q=" + encodedName + "&per_page=1";

            JsonNode response = restClient.get()
                    .uri(url)
                    .retrieve()
                    .body(JsonNode.class);

            if (response == null || !response.has("results")) {
                return null;
            }

            JsonNode results = response.get("results");
            if (results.isEmpty()) {
                return null;
            }

            JsonNode taxon = results.get(0);
            if (taxon.has("default_photo") && !taxon.get("default_photo").isNull()) {
                JsonNode photo = taxon.get("default_photo");
                String mediumUrl = getTextOrNull(photo, "medium_url");
                String squareUrl = getTextOrNull(photo, "square_url");
                String attribution = getTextOrNull(photo, "attribution");

                if (mediumUrl != null) {
                    return new ImageResult(
                            mediumUrl,
                            squareUrl != null ? squareUrl : mediumUrl,
                            ImageSource.INATURALIST,
                            "CC BY-NC",
                            attribution
                    );
                }
            }
            return null;
        } catch (Exception e) {
            log.debug("iNaturalist image lookup failed for '{}': {}", scientificName, e.getMessage());
            return null;
        }
    }

    private String getTextOrNull(JsonNode node, String field) {
        if (node.has(field) && !node.get(field).isNull()) {
            return node.get(field).asText();
        }
        return null;
    }

    public record ImageResult(
            String imageUrl,
            String thumbnailUrl,
            ImageSource source,
            String license,
            String attribution
    ) {
    }
}
