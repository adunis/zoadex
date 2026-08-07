package com.zoadex.api.sighting;

import com.zoadex.api.sighting.dto.ExpeditionResponse;
import com.zoadex.api.sighting.dto.StartExpeditionRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/expeditions")
@RequiredArgsConstructor
public class ExpeditionController {

    private final ExpeditionService expeditionService;

    /**
     * POST /api/v1/expeditions/start
     */
    @PostMapping("/start")
    public ResponseEntity<ExpeditionResponse> startExpedition(
            Authentication authentication,
            @RequestBody(required = false) StartExpeditionRequest request) {
        UUID userId = (UUID) authentication.getPrincipal();
        StartExpeditionRequest effectiveRequest = request != null ? request : new StartExpeditionRequest();
        ExpeditionResponse response = expeditionService.startExpedition(userId, effectiveRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * PUT /api/v1/expeditions/{id}/end
     */
    @PutMapping("/{id}/end")
    public ResponseEntity<ExpeditionResponse> endExpedition(
            Authentication authentication,
            @PathVariable UUID id) {
        UUID userId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(expeditionService.endExpedition(userId, id));
    }

    @GetMapping("/active")
    public ResponseEntity<ExpeditionResponse> getActiveExpedition(Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        return expeditionService.getActiveExpedition(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @GetMapping
    public ResponseEntity<Page<ExpeditionResponse>> getUserExpeditions(
            Authentication authentication, Pageable pageable) {
        UUID userId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(expeditionService.getUserExpeditions(userId, pageable));
    }
}
