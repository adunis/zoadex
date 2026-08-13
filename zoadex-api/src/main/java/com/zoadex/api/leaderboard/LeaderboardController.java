package com.zoadex.api.leaderboard;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/leaderboard")
@RequiredArgsConstructor
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    /**
     * GET /api/v1/leaderboard/{regionId}?period=weekly|monthly|alltime&limit=20
     */
    @GetMapping("/{regionId}")
    public ResponseEntity<List<LeaderboardEntry>> getLeaderboard(
            @PathVariable UUID regionId,
            @RequestParam(defaultValue = "alltime") String period,
            @RequestParam(defaultValue = "20") int limit) {
        List<LeaderboardEntry> entries = leaderboardService.getLeaderboard(regionId, period, Math.min(limit, 100));
        return ResponseEntity.ok(entries);
    }
}
