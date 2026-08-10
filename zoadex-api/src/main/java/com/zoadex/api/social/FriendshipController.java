package com.zoadex.api.social;

import com.zoadex.api.user.User;
import com.zoadex.api.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/friends")
@RequiredArgsConstructor
public class FriendshipController {

    private final FriendshipService friendshipService;
    private final UserRepository userRepository;

    @PostMapping("/request/{addresseeId}")
    public ResponseEntity<Map<String, Object>> sendRequest(
            @RequestAttribute("userId") UUID userId,
            @PathVariable UUID addresseeId) {
        Friendship f = friendshipService.sendFriendRequest(userId, addresseeId);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "id", f.getId(),
                "status", f.getStatus()
        ));
    }

    @PostMapping("/{friendshipId}/accept")
    public ResponseEntity<Map<String, String>> acceptRequest(
            @RequestAttribute("userId") UUID userId,
            @PathVariable UUID friendshipId) {
        friendshipService.acceptFriendRequest(userId, friendshipId);
        return ResponseEntity.ok(Map.of("status", "ACCEPTED"));
    }

    @PostMapping("/{friendshipId}/decline")
    public ResponseEntity<Map<String, String>> declineRequest(
            @RequestAttribute("userId") UUID userId,
            @PathVariable UUID friendshipId) {
        friendshipService.declineFriendRequest(userId, friendshipId);
        return ResponseEntity.ok(Map.of("status", "DECLINED"));
    }

    @DeleteMapping("/{friendId}")
    public ResponseEntity<Void> removeFriend(
            @RequestAttribute("userId") UUID userId,
            @PathVariable UUID friendId) {
        friendshipService.removeFriend(userId, friendId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getFriends(@RequestAttribute("userId") UUID userId) {
        List<Friendship> friendships = friendshipService.getFriends(userId);

        List<Map<String, Object>> friends = friendships.stream().map(f -> {
            UUID friendId = f.getRequesterId().equals(userId) ? f.getAddresseeId() : f.getRequesterId();
            User friend = userRepository.findById(friendId).orElse(null);

            Map<String, Object> map = new HashMap<>();
            map.put("friendshipId", f.getId());
            map.put("userId", friendId);
            map.put("username", friend != null ? friend.getUsername() : "Unknown");
            map.put("level", friend != null ? friend.getLevel() : 1);
            map.put("activeRegion", friend != null && friend.getActiveRegion() != null ? friend.getActiveRegion().getName() : null);
            map.put("since", f.getCreatedAt().toString());
            return map;
        }).toList();

        return ResponseEntity.ok(friends);
    }

    @GetMapping("/requests")
    public ResponseEntity<List<Map<String, Object>>> getPendingRequests(@RequestAttribute("userId") UUID userId) {
        List<Friendship> pending = friendshipService.getPendingRequests(userId);

        List<Map<String, Object>> requests = pending.stream().map(f -> {
            User requester = userRepository.findById(f.getRequesterId()).orElse(null);
            Map<String, Object> map = new HashMap<>();
            map.put("friendshipId", f.getId());
            map.put("requesterId", f.getRequesterId());
            map.put("username", requester != null ? requester.getUsername() : "Unknown");
            map.put("level", requester != null ? requester.getLevel() : 1);
            map.put("sentAt", f.getCreatedAt().toString());
            return map;
        }).toList();

        return ResponseEntity.ok(requests);
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<Map<String, Object>>> getNearbyExplorers(@RequestAttribute("userId") UUID userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null || user.getActiveRegion() == null) {
            return ResponseEntity.ok(List.of());
        }

        UUID regionId = user.getActiveRegion().getId();
        List<UUID> friendIds = friendshipService.getFriendIds(userId);

        // Find other users in the same region (not already friends, not self)
        List<User> regionUsers = userRepository.findByActiveRegionId(regionId);
        List<Map<String, Object>> nearby = regionUsers.stream()
                .filter(u -> !u.getId().equals(userId))
                .filter(u -> !friendIds.contains(u.getId()))
                .limit(20)
                .map(u -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("userId", u.getId());
                    map.put("username", u.getUsername());
                    map.put("level", u.getLevel());
                    return map;
                }).toList();

        return ResponseEntity.ok(nearby);
    }
}
