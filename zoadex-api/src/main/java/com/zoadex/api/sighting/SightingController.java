package com.zoadex.api.sighting;

import com.zoadex.api.map.dto.SightingPin;
import com.zoadex.api.sighting.dto.CreateSightingRequest;
import com.zoadex.api.sighting.dto.SightingResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/sightings")
@RequiredArgsConstructor
public class SightingController {

    private final SightingService sightingService;

    @PostMapping
    public ResponseEntity<SightingResponse> createSighting(
            Authentication authentication,
            @Valid @RequestBody CreateSightingRequest request) {
        UUID userId = (UUID) authentication.getPrincipal();
        SightingResponse response = sightingService.createSighting(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * GET /api/v1/sightings?userId=&speciesId=
     */
    @GetMapping
    public ResponseEntity<?> getSightings(
            Authentication authentication,
            @RequestParam(required = false) UUID userId,
            @RequestParam(required = false) UUID speciesId,
            Pageable pageable) {
        UUID currentUserId = (UUID) authentication.getPrincipal();
        UUID effectiveUserId = userId != null ? userId : currentUserId;

        if (speciesId != null) {
            List<SightingResponse> sightings = sightingService.getSightingsBySpecies(effectiveUserId, speciesId);
            return ResponseEntity.ok(sightings);
        }
        return ResponseEntity.ok(sightingService.getUserSightings(effectiveUserId, pageable));
    }

    /**
     * GET /api/v1/sightings/map?bbox=minLat,minLon,maxLat,maxLon
     */
    @GetMapping("/map")
    public ResponseEntity<List<SightingPin>> getSightingsForMap(
            Authentication authentication,
            @RequestParam(required = false) String bbox) {
        UUID userId = (UUID) authentication.getPrincipal();

        Double minLat = null, minLon = null, maxLat = null, maxLon = null;
        if (bbox != null && !bbox.isBlank()) {
            String[] parts = bbox.split(",");
            if (parts.length == 4) {
                minLat = Double.parseDouble(parts[0].trim());
                minLon = Double.parseDouble(parts[1].trim());
                maxLat = Double.parseDouble(parts[2].trim());
                maxLon = Double.parseDouble(parts[3].trim());
            }
        }

        return ResponseEntity.ok(sightingService.getSightingsForMap(userId, minLat, minLon, maxLat, maxLon));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SightingResponse> getSightingById(@PathVariable UUID id) {
        return ResponseEntity.ok(sightingService.getSightingById(id));
    }
}
