package com.zoadex.api.user;

import com.zoadex.api.user.dto.UpdateRegionRequest;
import com.zoadex.api.user.dto.UserProfileResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<?> getProfile(Authentication authentication) {
        try {
            UUID userId = (UUID) authentication.getPrincipal();
            return ResponseEntity.ok(userService.getProfile(userId));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "error", e.getMessage() != null ? e.getMessage() : "Unknown error",
                "type", e.getClass().getSimpleName()
            ));
        }
    }

    /**
     * GET /api/v1/users/me/export — GDPR data export
     */
    @GetMapping("/me/export")
    public ResponseEntity<?> exportMyData(Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        Map<String, Object> data = userService.exportUserData(userId);
        return ResponseEntity.ok(data);
    }

    /**
     * DELETE /api/v1/users/me — GDPR account deletion
     */
    @DeleteMapping("/me")
    public ResponseEntity<?> deleteMyAccount(Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        userService.deleteAccount(userId);
        return ResponseEntity.ok(Map.of("deleted", true));
    }

    /**
     * PUT /api/v1/users/me/region
     */
    @PutMapping("/me/region")
    public ResponseEntity<UserProfileResponse> setActiveRegion(
            Authentication authentication,
            @Valid @RequestBody UpdateRegionRequest request) {
        UUID userId = (UUID) authentication.getPrincipal();
        userService.setActiveRegion(userId, request.getRegionId());
        return ResponseEntity.ok(userService.getProfile(userId));
    }

    /**
     * GET /api/v1/users/me/regions — returns list of unlocked region IDs
     */
    @GetMapping("/me/regions")
    public ResponseEntity<?> getMyRegions(Authentication authentication) {
        try {
            UUID userId = (UUID) authentication.getPrincipal();
            return ResponseEntity.ok(userService.getUnlockedRegions(userId));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "error", e.getMessage() != null ? e.getMessage() : "Unknown error",
                "type", e.getClass().getSimpleName()
            ));
        }
    }

    /**
     * POST /api/v1/users/me/regions/{regionId} — unlock a region without activating it
     */
    @PostMapping("/me/regions/{regionId}")
    public ResponseEntity<?> unlockRegion(
            Authentication authentication,
            @PathVariable UUID regionId) {
        try {
            UUID userId = (UUID) authentication.getPrincipal();
            userService.unlockRegion(userId, regionId);
            return ResponseEntity.ok(Map.of("unlocked", regionId.toString()));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of(
                "error", e.getMessage() != null ? e.getMessage() : "Unknown error"
            ));
        }
    }
}

