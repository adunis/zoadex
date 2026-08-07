package com.zoadex.api.species;

import com.zoadex.api.species.dto.SpeciesResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/species")
@RequiredArgsConstructor
public class SpeciesController {

    private final SpeciesService speciesService;

    /**
     * GET /api/v1/species?regionId=&category=
     */
    @GetMapping
    public ResponseEntity<Page<SpeciesResponse>> getSpecies(
            @RequestParam(required = false) UUID regionId,
            @RequestParam(required = false) SpeciesCategory category,
            @RequestParam(required = false) String q,
            Pageable pageable) {
        if (q != null && !q.isBlank()) {
            return ResponseEntity.ok(speciesService.search(q, pageable));
        }
        if (regionId != null) {
            return ResponseEntity.ok(speciesService.getSpeciesByRegion(regionId, category, pageable));
        }
        return ResponseEntity.ok(speciesService.search("", pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SpeciesResponse> getSpeciesById(@PathVariable UUID id) {
        return ResponseEntity.ok(speciesService.getSpeciesById(id));
    }
}
