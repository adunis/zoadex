package com.zoadex.api.badge;

import com.zoadex.api.badge.dto.BadgeProgressResponse;
import com.zoadex.api.badge.dto.BadgeResponse;
import com.zoadex.api.badge.dto.UserBadgeResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
     * GET /api/v1/badges/my
     */
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
