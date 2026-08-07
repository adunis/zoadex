package com.zoadex.api.region;

import com.zoadex.api.common.exception.ResourceNotFoundException;
import com.zoadex.api.gbif.GbifService;
import com.zoadex.api.image.ImageResolutionService;
import com.zoadex.api.region.dto.ChecklistResponse;
import com.zoadex.api.region.dto.RegionResponse;
import com.zoadex.api.region.dto.SpeciesSummaryResponse;
import com.zoadex.api.species.Species;
import com.zoadex.api.species.SpeciesCategory;
import com.zoadex.api.species.SpeciesRepository;
import com.zoadex.api.species.dto.SpeciesResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.atomic.AtomicInteger;

@Slf4j
@RestController
@RequestMapping("/api/v1/regions")
@RequiredArgsConstructor
public class RegionController {

    private final RegionService regionService;
    private final RegionRepository regionRepository;
    private final GbifService gbifService;
    private final ImageResolutionService imageResolutionService;
    private final RegionSpeciesRepository regionSpeciesRepository;
    private final SpeciesRepository speciesRepository;

    @GetMapping
    public ResponseEntity<List<RegionResponse>> getAllRegions(
            @RequestParam(required = false) String continent) {
        if (continent != null && !continent.isBlank()) {
            return ResponseEntity.ok(regionService.getRegionsByContinent(continent));
        }
        return ResponseEntity.ok(regionService.getAllRegions());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RegionResponse> getRegionById(@PathVariable UUID id) {
        return ResponseEntity.ok(regionService.getRegionById(id));
    }

    @GetMapping("/{id}/boundary")
    public ResponseEntity<Map<String, List<double[]>>> getBoundary(@PathVariable UUID id) {
        regionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Region", "id", id));

        List<Object[]> points = regionRepository.getBoundaryPoints(id);
        List<double[]> coordinates = points.stream()
                .map(row -> new double[]{((Number) row[0]).doubleValue(), ((Number) row[1]).doubleValue()})
                .toList();

        return ResponseEntity.ok(Map.of("coordinates", coordinates));
    }

    @GetMapping("/{id}/species")
    public ResponseEntity<Page<SpeciesResponse>> getRegionSpecies(
            @PathVariable UUID id,
            @RequestParam(required = false) SpeciesCategory category,
            Pageable pageable) {
        return ResponseEntity.ok(regionService.getRegionSpecies(id, category, pageable));
    }

    @GetMapping("/{id}/species-summary")
    public ResponseEntity<List<SpeciesSummaryResponse>> getSpeciesSummary(@PathVariable UUID id) {
        return ResponseEntity.ok(regionService.getSpeciesSummary(id));
    }

    @GetMapping("/{id}/checklist")
    public ResponseEntity<ChecklistResponse> getRegionChecklist(
            @PathVariable UUID id,
            Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(regionService.getRegionChecklist(id, userId));
    }

    /**
     * Simple POST test endpoint to verify security matcher configuration.
     */
    @PostMapping("/{id}/test-post")
    public ResponseEntity<Map<String, String>> testPost(@PathVariable UUID id) {
        return ResponseEntity.ok(Map.of("status", "ok", "regionId", id.toString()));
    }

    /**
     * Triggers GBIF import for the region. Long-running operation.
     */
    @PostMapping("/{id}/import")
    public ResponseEntity<Map<String, Object>> importSpecies(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "5000") int limit,
            Authentication authentication) {
        log.info("Import triggered for region {} with limit {}", id, limit);
        try {
            int importedCount = gbifService.importSpeciesForRegion(id, limit);
            int imagesResolved = imageResolutionService.resolveImagesForRegion(id);
            return ResponseEntity.ok(Map.of(
                    "speciesImported", importedCount,
                    "imagesResolved", imagesResolved,
                    "regionId", id.toString()
            ));
        } catch (Exception e) {
            log.error("Import failed for region {}", id, e);
            return ResponseEntity.status(500)
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }

    /**
     * Triggers occurrence data import for species in a region.
     * Imports coordinates from GBIF for each species to populate the map.
     * Long-running operation - imports up to maxSpecies species using parallel threads.
     */
    @PostMapping("/{id}/import-occurrences")
    public ResponseEntity<Map<String, Object>> importOccurrences(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "100") int maxSpecies,
            Authentication authentication) {
        log.info("Occurrence import triggered for region {} by user {}, maxSpecies={}",
                id, authentication != null ? authentication.getPrincipal() : "unknown", maxSpecies);
        try {
            List<UUID> speciesIds = regionSpeciesRepository.findSpeciesIdsWithoutOccurrences(id, maxSpecies);
            AtomicInteger totalImported = new AtomicInteger(0);

            ExecutorService executor = Executors.newFixedThreadPool(2);
            List<Future<?>> futures = new ArrayList<>();

            for (UUID speciesId : speciesIds) {
                futures.add(executor.submit(() -> {
                    int count = gbifService.importOccurrenceData(id, speciesId);
                    totalImported.addAndGet(count);
                }));
            }

            for (Future<?> f : futures) {
                try {
                    f.get();
                } catch (Exception e) {
                    log.warn("Parallel import error: {}", e.getMessage());
                }
            }
            executor.shutdown();

            return ResponseEntity.ok(Map.of(
                    "speciesProcessed", speciesIds.size(),
                    "occurrencesImported", totalImported.get(),
                    "regionId", id.toString()
            ));
        } catch (Exception e) {
            log.error("Occurrence import failed for region {}", id, e);
            return ResponseEntity.status(500)
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }

    /**
     * Imports vernacular names in all supported languages from GBIF for species in a region
     * that don't have translated names yet.
     */
    @PostMapping("/{id}/import-names")
    public ResponseEntity<Map<String, Object>> importNames(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "200") int limit,
            Authentication authentication) {
        log.info("Multi-language name import triggered for region {}", id);
        try {
            List<Species> species = speciesRepository.findByRegionWithoutNames(id, limit);
            int updated = 0;
            for (Species sp : species) {
                if (sp.getGbifKey() == null) continue;
                Map<String, String> names = gbifService.fetchVernacularNames(sp.getGbifKey());
                if (!names.isEmpty()) {
                    if (names.containsKey("it")) sp.setNameIt(names.get("it"));
                    if (names.containsKey("fr")) sp.setNameFr(names.get("fr"));
                    if (names.containsKey("es")) sp.setNameEs(names.get("es"));
                    if (names.containsKey("de")) sp.setNameDe(names.get("de"));
                    if (names.containsKey("zh")) sp.setNameZh(names.get("zh"));
                    if (names.containsKey("ar")) sp.setNameAr(names.get("ar"));
                    if (names.containsKey("ja")) sp.setNameJa(names.get("ja"));
                    speciesRepository.save(sp);
                    updated++;
                }
            }
            return ResponseEntity.ok(Map.of("processed", species.size(), "updated", updated, "regionId", id.toString()));
        } catch (Exception e) {
            log.error("Name import failed", e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}

