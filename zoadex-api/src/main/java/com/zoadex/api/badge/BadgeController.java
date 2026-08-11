package com.zoadex.api.badge;

import com.zoadex.api.badge.dto.BadgeProgressResponse;
import com.zoadex.api.badge.dto.BadgeResponse;
import com.zoadex.api.badge.dto.UserBadgeResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/badges")
@RequiredArgsConstructor
public class BadgeController {

    private final BadgeService badgeService;

    @GetMapping
    public ResponseEntity<List<BadgeResponse>> getAllBadges() {
        return ResponseEntity.ok(badgeService.getAllBadges());
    }

    /**
     * GET /api/v1/badges/all - returns all badges with unlock status for the authenticated user
     */
    @GetMapping("/all")
    public ResponseEntity<List<BadgeResponse>> getAllBadgesWithStatus(Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(badgeService.getAllBadgesWithStatus(userId));
    }

    /**
     * GET /api/v1/badges/region/{regionId} - returns badges specific to a region
     */
    @GetMapping("/region/{regionId}")
    public ResponseEntity<List<BadgeResponse>> getRegionBadges(
            @PathVariable UUID regionId,
            Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(badgeService.getRegionBadgesWithStatus(userId, regionId));
    }

    @GetMapping("/my")
    public ResponseEntity<List<UserBadgeResponse>> getUserBadges(Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(badgeService.getUserBadges(userId));
    }

    @GetMapping("/progress")
    public ResponseEntity<List<BadgeProgressResponse>> getUserProgress(Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(badgeService.getUserProgress(userId));
    }
}
