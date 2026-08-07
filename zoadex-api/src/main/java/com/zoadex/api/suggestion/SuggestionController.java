package com.zoadex.api.suggestion;

import com.zoadex.api.suggestion.dto.SuggestionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/suggestions")
@RequiredArgsConstructor
public class SuggestionController {

    private final SuggestionService suggestionService;

    /**
     * GET /api/v1/suggestions?lat=&lon=&timestamp=
     * Works without authentication — user-specific boosting is skipped when unauthenticated.
     */
    @GetMapping
    public ResponseEntity<List<SuggestionResponse>> getSuggestions(
            @RequestParam Double lat,
            @RequestParam Double lon,
            @RequestParam(required = false) String timestamp,
            Authentication authentication) {

        UUID userId = authentication != null ? (UUID) authentication.getPrincipal() : null;
        LocalDateTime effectiveTimestamp = timestamp != null
                ? LocalDateTime.parse(timestamp.replace("Z", ""))
                : LocalDateTime.now();

        List<SuggestionResponse> suggestions = suggestionService
                .getSuggestions(userId, lat, lon, effectiveTimestamp);

        return ResponseEntity.ok(suggestions);
    }
}
