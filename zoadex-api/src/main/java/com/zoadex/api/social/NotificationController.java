package com.zoadex.api.social;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getNotifications(
            @RequestAttribute("userId") UUID userId,
            @RequestParam(defaultValue = "50") int limit) {

        var notifications = notificationService.getNotifications(userId, limit);
        long unreadCount = notificationService.getUnreadCount(userId);

        List<Map<String, Object>> items = notifications.stream().map(n -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", n.getId());
            map.put("type", n.getType());
            map.put("title", n.getTitle());
            map.put("message", n.getMessage());
            map.put("referenceId", n.getReferenceId());
            map.put("read", n.isRead());
            map.put("createdAt", n.getCreatedAt().toString());
            return map;
        }).toList();

        return ResponseEntity.ok(Map.of(
                "notifications", items,
                "unreadCount", unreadCount
        ));
    }

    @PostMapping("/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(
            @RequestAttribute("userId") UUID userId,
            @PathVariable UUID notificationId) {
        notificationService.markAsRead(userId, notificationId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(@RequestAttribute("userId") UUID userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.noContent().build();
    }
}
