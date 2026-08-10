package com.zoadex.api.xp;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/xp")
@RequiredArgsConstructor
public class XpController {

    private final XpService xpService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getXpSummary(@RequestAttribute("userId") UUID userId) {
        var summary = xpService.getXpSummary(userId);

        var recentEvents = summary.recentEvents().stream().map(e -> Map.of(
                "id", (Object) e.getId(),
                "amount", e.getAmount(),
                "reason", e.getReason(),
                "description", e.getDescription() != null ? e.getDescription() : "",
                "createdAt", e.getCreatedAt().toString()
        )).toList();

        return ResponseEntity.ok(Map.of(
                "totalXp", summary.totalXp(),
                "level", summary.level(),
                "xpInCurrentLevel", summary.xpInCurrentLevel(),
                "xpNeededForNext", summary.xpNeededForNext(),
                "progressPercent", summary.xpNeededForNext() > 0
                        ? (int) ((double) summary.xpInCurrentLevel() / summary.xpNeededForNext() * 100)
                        : 100,
                "recentEvents", recentEvents
        ));
    }
}
