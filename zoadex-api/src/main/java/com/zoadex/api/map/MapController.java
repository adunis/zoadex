package com.zoadex.api.map;

import com.zoadex.api.map.dto.HeatmapPoint;
import com.zoadex.api.map.dto.OccurrencePointResponse;
import com.zoadex.api.map.dto.SightingPin;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/map")
@RequiredArgsConstructor
public class MapController {

    private final MapService mapService;

    /**
     * GET /api/v1/map/heatmap?regionId=&bbox=minLat,minLon,maxLat,maxLon&month=
     */
    @GetMapping("/heatmap")
    public ResponseEntity<List<HeatmapPoint>> getHeatmapData(
            @RequestParam UUID regionId,
            @RequestParam(required = false) String bbox,
            @RequestParam(required = false) Integer month) {

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

        return ResponseEntity.ok(mapService.getHeatmapData(regionId, minLat, minLon, maxLat, maxLon, month));
    }

    /**
     * GET /api/v1/map/occurrence-points?regionId=&categories=&limit=
     * Returns raw occurrence coordinates for one or more categories (not grid-aggregated).
     * Accepts repeated {@code categories} query params, e.g. {@code ?categories=MAMMALS&categories=INSECTS}.
     */
    @GetMapping("/occurrence-points")
    public ResponseEntity<List<OccurrencePointResponse>> getOccurrencePoints(
            @RequestParam UUID regionId,
            @RequestParam(required = false) List<String> categories,
            @RequestParam(defaultValue = "2000") int limit) {
        return ResponseEntity.ok(mapService.getOccurrencePoints(regionId, categories, limit));
    }

    /**
     * GET /api/v1/map/pins?bbox=minLat,minLon,maxLat,maxLon
     */
    @GetMapping("/pins")
    public ResponseEntity<List<SightingPin>> getUserSightingPins(
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

        return ResponseEntity.ok(mapService.getUserSightingPins(userId, minLat, minLon, maxLat, maxLon));
    }
}
