package com.zoadex.api.gbif;

import com.fasterxml.jackson.databind.JsonNode;
import com.zoadex.api.common.exception.ResourceNotFoundException;
import com.zoadex.api.gbif.dto.GbifOccurrenceResult;
import com.zoadex.api.region.Region;
import com.zoadex.api.region.RegionRepository;
import com.zoadex.api.region.RegionSpecies;
import com.zoadex.api.region.RegionSpeciesRepository;
import com.zoadex.api.species.Species;
import com.zoadex.api.species.SpeciesCategory;
import com.zoadex.api.species.SpeciesOccurrence;
import com.zoadex.api.species.SpeciesOccurrenceRepository;
import com.zoadex.api.species.SpeciesRepository;
import com.zoadex.api.suggestion.TimeBucket;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.Geometry;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class GbifService {

    private final RestClient restClient;
    private final RegionRepository regionRepository;
    private final SpeciesRepository speciesRepository;
    private final RegionSpeciesRepository regionSpeciesRepository;
    private final SpeciesOccurrenceRepository occurrenceRepository;

    @Value("${zoadex.gbif.base-url}")
    private String gbifBaseUrl;

    private static final GeometryFactory GEOMETRY_FACTORY = new GeometryFactory(new PrecisionModel(), 4326);
    private static final int RATE_LIMIT_DELAY_MS = 1000; // 1 req/s per thread, safe with 2 threads = 2 req/s total

    // Tree orders/families for Plantae classification
    private static final Set<String> TREE_ORDERS = Set.of(
            "Pinales", "Fagales", "Sapindales", "Rosales", "Lamiales",
            "Magnoliales", "Laurales", "Cupressales"
    );
    private static final Set<String> TREE_FAMILIES = Set.of(
            "Pinaceae", "Fagaceae", "Betulaceae", "Juglandaceae", "Salicaceae",
            "Aceraceae", "Sapindaceae", "Oleaceae", "Ulmaceae", "Tiliaceae",
            "Cupressaceae", "Taxaceae", "Platanaceae", "Moraceae"
    );

    // Rate limiting is handled via Thread.sleep per call (thread-safe for parallel use)

    /**
     * Import species for a region by querying GBIF occurrence API with the region's bounding box.
     * Uses balanced per-taxonomic-group faceting to avoid bird-dominated results.
     * Each species import is independent — failures are logged and skipped.
     */
    public int importSpeciesForRegion(UUID regionId, int speciesLimit) {
        Region region = regionRepository.findById(regionId)
                .orElseThrow(() -> new ResourceNotFoundException("Region", "id", regionId));

        String wkt = buildWktFromBoundary(region);
        log.info("Starting balanced GBIF import for region '{}' with limit {}", region.getName(), speciesLimit);

        // Balanced import: divide limit across taxonomic groups
        int perGroup = Math.max(speciesLimit / 8, 10); // at least 10 per group

        Map<Long, Integer> gbifCounts = new HashMap<>();
        List<Long> allSpeciesKeys = new ArrayList<>();

        // Birds (Aves)
        collectSpeciesKeys(wkt, perGroup, "&taxonKey=212", allSpeciesKeys, gbifCounts);
        // Mammals
        collectSpeciesKeys(wkt, perGroup, "&taxonKey=359", allSpeciesKeys, gbifCounts);
        // Reptiles
        collectSpeciesKeys(wkt, perGroup / 2, "&taxonKey=358", allSpeciesKeys, gbifCounts);
        // Amphibians
        collectSpeciesKeys(wkt, perGroup / 2, "&taxonKey=131", allSpeciesKeys, gbifCounts);
        // Insects
        collectSpeciesKeys(wkt, perGroup, "&taxonKey=216", allSpeciesKeys, gbifCounts);
        // Fish (Actinopterygii)
        collectSpeciesKeys(wkt, perGroup / 2, "&taxonKey=204", allSpeciesKeys, gbifCounts);
        // Plants (Plantae kingdom)
        collectSpeciesKeys(wkt, perGroup, "&taxonKey=6", allSpeciesKeys, gbifCounts);
        // Fungi
        collectSpeciesKeys(wkt, perGroup, "&taxonKey=5", allSpeciesKeys, gbifCounts);

        // Cap at the requested limit
        if (allSpeciesKeys.size() > speciesLimit) {
            allSpeciesKeys = allSpeciesKeys.subList(0, speciesLimit);
        }

        log.info("Found {} unique species keys across all groups for region '{}'",
                allSpeciesKeys.size(), region.getName());

        int importedCount = 0;
        for (Long speciesKey : allSpeciesKeys) {
            int gbifCount = gbifCounts.getOrDefault(speciesKey, 0);
            try {
                if (speciesRepository.findByGbifKey(speciesKey).isPresent()) {
                    Species existing = speciesRepository.findByGbifKey(speciesKey).get();
                    ensureRegionSpeciesLink(regionId, existing.getId(), gbifCount);
                    continue;
                }

                rateLimitDelay();
                Species species = fetchAndSaveSpecies(speciesKey);
                if (species != null) {
                    ensureRegionSpeciesLink(regionId, species.getId(), gbifCount);
                    importedCount++;
                }
            } catch (Exception e) {
                log.warn("Failed to import species with key {}: {}", speciesKey, e.getMessage());
            }
        }

        // Update region species count
        long totalSpecies = regionSpeciesRepository.countByRegionId(regionId);
        region.setSpeciesCount((int) totalSpecies);
        region.setLastSynced(LocalDateTime.now());
        regionRepository.save(region);

        log.info("Import complete for region '{}': {} new species imported, {} total species",
                region.getName(), importedCount, totalSpecies);
        return importedCount;
    }

    /**
     * Import occurrence data (coordinates + months) for a specific species in a region.
     * Fetches up to 300 in a single GBIF call and batch-saves to DB.
     */
    public int importOccurrenceData(UUID regionId, UUID speciesId) {
        Region region = regionRepository.findById(regionId)
                .orElseThrow(() -> new ResourceNotFoundException("Region", "id", regionId));
        Species species = speciesRepository.findById(speciesId)
                .orElseThrow(() -> new ResourceNotFoundException("Species", "id", speciesId));

        if (species.getGbifKey() == null) {
            log.warn("Species {} has no GBIF key, skipping occurrence import", species.getScientificName());
            return 0;
        }

        String wkt = buildWktFromBoundary(region);
        int imported = 0;
        int offset = 0;
        int limit = 300;
        int maxOccurrencesPerSpecies = 20;
        List<SpeciesOccurrence> batch = new ArrayList<>();

        while (true) {
            if (imported >= maxOccurrencesPerSpecies) {
                break;
            }
            rateLimitDelay();
            int fetchLimit = Math.min(limit, maxOccurrencesPerSpecies - imported);
            GbifOccurrenceResult result = fetchOccurrences(species.getGbifKey(), wkt, fetchLimit, offset);
            if (result == null || result.getResults() == null || result.getResults().isEmpty()) {
                break;
            }

            for (GbifOccurrenceResult.GbifOccurrence occ : result.getResults()) {
                if (imported >= maxOccurrencesPerSpecies) {
                    break;
                }
                if (occ.getDecimalLatitude() == null || occ.getDecimalLongitude() == null) {
                    continue;
                }

                try {
                    org.locationtech.jts.geom.Point point = GEOMETRY_FACTORY.createPoint(
                            new Coordinate(occ.getDecimalLongitude(), occ.getDecimalLatitude()));

                    Short month = occ.getMonth() != null ? occ.getMonth().shortValue() : null;

                    SpeciesOccurrence occurrence = SpeciesOccurrence.builder()
                            .speciesId(speciesId)
                            .regionId(regionId)
                            .location(point)
                            .month(month)
                            .timeBucket(TimeBucket.MORNING) // default; GBIF doesn't usually provide time
                            .occurrenceCount(1)
                            .build();

                    batch.add(occurrence);
                    imported++;
                } catch (Exception e) {
                    log.warn("Failed to build occurrence for species {} at ({}, {}): {}",
                            speciesId, occ.getDecimalLatitude(), occ.getDecimalLongitude(), e.getMessage());
                }
            }

            if (result.isEndOfRecords() || result.getResults().size() < fetchLimit) {
                break;
            }
            offset += fetchLimit;
        }

        // Batch save all occurrences at once
        if (!batch.isEmpty()) {
            occurrenceRepository.saveAll(batch);
        }

        log.info("Imported {} occurrences for species '{}' in region '{}'",
                imported, species.getScientificName(), region.getName());
        return imported;
    }

    /**
     * Fetches species keys from GBIF for the given geometry and taxonomy filter,
     * appending results to the provided lists/maps.
     */
    private void collectSpeciesKeys(String wkt, int facetLimit, String additionalParams,
                                    List<Long> speciesKeys, Map<Long, Integer> gbifCounts) {
        try {
            rateLimitDelay();
            String url = gbifBaseUrl + "/occurrence/search?geometry=" + wkt
                    + "&facet=speciesKey&facetLimit=" + facetLimit + "&limit=0" + additionalParams;
            JsonNode response = restClient.get()
                    .uri(url)
                    .retrieve()
                    .body(JsonNode.class);

            if (response != null && response.has("facets")) {
                JsonNode facets = response.get("facets");
                for (JsonNode facet : facets) {
                    if ("SPECIES_KEY".equals(facet.get("field").asText())) {
                        JsonNode counts = facet.get("counts");
                        for (JsonNode count : counts) {
                            long key = Long.parseLong(count.get("name").asText());
                            int gbifCount = count.get("count").asInt();
                            speciesKeys.add(key);
                            gbifCounts.put(key, gbifCount);
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error fetching species keys from GBIF with params '{}': {}",
                    additionalParams, e.getMessage());
        }
    }

    private Species fetchAndSaveSpecies(Long speciesKey) {
        try {
            JsonNode speciesData = restClient.get()
                    .uri(gbifBaseUrl + "/species/{key}", speciesKey)
                    .retrieve()
                    .body(JsonNode.class);

            if (speciesData == null) {
                return null;
            }

            String scientificName = getTextOrNull(speciesData, "canonicalName");
            if (scientificName == null) {
                scientificName = getTextOrNull(speciesData, "scientificName");
            }
            if (scientificName == null) {
                return null;
            }

            String kingdom = getTextOrNull(speciesData, "kingdom");
            String clazz = getTextOrNull(speciesData, "class");
            String order = getTextOrNull(speciesData, "order");
            String family = getTextOrNull(speciesData, "family");
            String vernacularName = getTextOrNull(speciesData, "vernacularName");

            SpeciesCategory category = mapToCategory(kingdom, clazz, order, family);

            Species species = Species.builder()
                    .gbifKey(speciesKey)
                    .scientificName(scientificName)
                    .commonName(vernacularName)
                    .category(category)
                    .taxonomyClass(clazz)
                    .taxonomyOrder(order)
                    .taxonomyFamily(family)
                    .build();

            return speciesRepository.save(species);
        } catch (Exception e) {
            log.warn("Error fetching species details for key {}: {}", speciesKey, e.getMessage());
            return null;
        }
    }

    private GbifOccurrenceResult fetchOccurrences(Long speciesKey, String wkt, int limit, int offset) {
        for (int attempt = 0; attempt < 2; attempt++) {
            try {
                return restClient.get()
                        .uri(gbifBaseUrl + "/occurrence/search?speciesKey={speciesKey}&geometry={wkt}&limit={limit}&offset={offset}",
                                speciesKey, wkt, limit, offset)
                        .retrieve()
                        .body(GbifOccurrenceResult.class);
            } catch (Exception e) {
                if (e.getMessage() != null && e.getMessage().contains("429") && attempt == 0) {
                    log.warn("GBIF rate limited, waiting 5s before retry...");
                    try {
                        Thread.sleep(5000);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                    }
                    continue;
                }
                log.error("Error fetching occurrences: {}", e.getMessage());
                return null;
            }
        }
        return null;
    }

    private void ensureRegionSpeciesLink(UUID regionId, UUID speciesId, int gbifCount) {
        RegionSpecies.RegionSpeciesId id = new RegionSpecies.RegionSpeciesId(regionId, speciesId);
        if (!regionSpeciesRepository.existsById(id)) {
            RegionSpecies link = RegionSpecies.builder()
                    .regionId(regionId)
                    .speciesId(speciesId)
                    .occurrenceCount(gbifCount)
                    .build();
            regionSpeciesRepository.save(link);
        } else {
            // Update count if not already set
            regionSpeciesRepository.findById(id).ifPresent(rs -> {
                if (rs.getOccurrenceCount() == null || rs.getOccurrenceCount() == 0) {
                    rs.setOccurrenceCount(gbifCount);
                    regionSpeciesRepository.save(rs);
                }
            });
        }
    }

    /**
     * Maps GBIF taxonomy to our SpeciesCategory.
     */
    // package-private for testing
    SpeciesCategory mapToCategory(String kingdom, String clazz, String order, String family) {
        if ("Animalia".equals(kingdom)) {
            if (clazz == null || clazz.isEmpty()) return SpeciesCategory.INSECTS;
            return switch (clazz) {
                case "Aves" -> SpeciesCategory.BIRDS;
                case "Mammalia" -> SpeciesCategory.MAMMALS;
                // Reptiles - GBIF uses order-level class names
                case "Reptilia", "Squamata", "Testudines", "Crocodilia", "Rhynchocephalia" -> SpeciesCategory.REPTILES;
                case "Amphibia" -> SpeciesCategory.AMPHIBIANS;
                // Fish - various classes
                case "Actinopterygii", "Chondrichthyes", "Elasmobranchii", "Cephalaspidomorphi", "Sarcopterygii" -> SpeciesCategory.FISH;
                case "Insecta", "Arachnida", "Chilopoda", "Diplopoda" -> SpeciesCategory.INSECTS;
                default -> SpeciesCategory.INSECTS;
            };
        }
        if ("Fungi".equals(kingdom)) {
            return SpeciesCategory.MUSHROOMS;
        }
        if ("Plantae".equals(kingdom)) {
            if (TREE_ORDERS.contains(order) || TREE_FAMILIES.contains(family)) {
                return SpeciesCategory.TREES;
            }
            return SpeciesCategory.PLANTS;
        }
        return SpeciesCategory.PLANTS;
    }

    private String buildWktFromBoundary(Region region) {
        if (region.getBoundary() == null) {
            // Fallback to a default bounding box if no boundary stored
            return "POLYGON((9.2 43.7, 12.8 43.7, 12.8 45.1, 9.2 45.1, 9.2 43.7))";
        }
        Geometry envelope = region.getBoundary().getEnvelope();
        Coordinate[] coords = envelope.getCoordinates();
        StringBuilder sb = new StringBuilder("POLYGON((");
        for (int i = 0; i < coords.length; i++) {
            if (i > 0) sb.append(", ");
            sb.append(coords[i].x).append(" ").append(coords[i].y);
        }
        sb.append("))");
        return sb.toString();
    }

    private void rateLimitDelay() {
        try {
            Thread.sleep(RATE_LIMIT_DELAY_MS);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    /**
     * Fetch the Italian vernacular name for a species from GBIF.
     */
    public String fetchItalianName(Long gbifKey) {
        try {
            rateLimitDelay();
            JsonNode response = restClient.get()
                    .uri(gbifBaseUrl + "/species/{key}/vernacularNames", gbifKey)
                    .retrieve()
                    .body(JsonNode.class);

            if (response != null && response.has("results")) {
                for (JsonNode name : response.get("results")) {
                    String lang = getTextOrNull(name, "language");
                    if ("ita".equals(lang) || "it".equals(lang)) {
                        return getTextOrNull(name, "vernacularName");
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Failed to fetch Italian name for gbifKey {}: {}", gbifKey, e.getMessage());
        }
        return null;
    }

    /**
     * Fetch vernacular names for all supported languages from GBIF.
     * Returns a map of language code (it, fr, es, de, zh, ar, ja) to name.
     */
    public Map<String, String> fetchVernacularNames(Long gbifKey) {
        Map<String, String> names = new HashMap<>();

        try {
            rateLimitDelay();
            JsonNode response = restClient.get()
                    .uri(gbifBaseUrl + "/species/{key}/vernacularNames", gbifKey)
                    .retrieve()
                    .body(JsonNode.class);

            if (response != null && response.has("results")) {
                for (JsonNode name : response.get("results")) {
                    String lang = getTextOrNull(name, "language");
                    String vernName = getTextOrNull(name, "vernacularName");
                    if (lang != null && vernName != null) {
                        String normalized = normalizeLanguage(lang);
                        if (normalized != null && !names.containsKey(normalized)) {
                            names.put(normalized, vernName);
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Failed to fetch vernacular names for gbifKey {}: {}", gbifKey, e.getMessage());
        }
        return names;
    }

    private String normalizeLanguage(String lang) {
        return switch (lang.toLowerCase()) {
            case "ita", "it" -> "it";
            case "fra", "fr" -> "fr";
            case "spa", "es" -> "es";
            case "deu", "de" -> "de";
            case "zho", "zh" -> "zh";
            case "ara", "ar" -> "ar";
            case "jpn", "ja" -> "ja";
            default -> null;
        };
    }

    private String getTextOrNull(JsonNode node, String field) {
        if (node.has(field) && !node.get(field).isNull()) {
            return node.get(field).asText();
        }
        return null;
    }
}
