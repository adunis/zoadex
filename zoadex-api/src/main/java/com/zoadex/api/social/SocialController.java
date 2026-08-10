package com.zoadex.api.social;

import com.zoadex.api.sighting.Sighting;
import com.zoadex.api.species.Species;
import com.zoadex.api.species.SpeciesRepository;
import com.zoadex.api.user.User;
import com.zoadex.api.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/social")
@RequiredArgsConstructor
public class SocialController {

    private final SocialService socialService;
    private final UserRepository userRepository;
    private final SpeciesRepository speciesRepository;

    // --- Comments ---

    @PostMapping("/sightings/{sightingId}/comments")
    public ResponseEntity<Map<String, Object>> addComment(
            @RequestAttribute("userId") UUID userId,
            @PathVariable UUID sightingId,
            @RequestBody Map<String, String> body) {
        String text = body.get("text");
        SightingComment comment = socialService.addComment(userId, sightingId, text);
        User user = userRepository.findById(userId).orElse(null);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "id", comment.getId(),
                "text", comment.getText(),
                "username", user != null ? user.getUsername() : "Unknown",
                "createdAt", comment.getCreatedAt().toString()
        ));
    }

    @GetMapping("/sightings/{sightingId}/comments")
    public ResponseEntity<List<Map<String, Object>>> getComments(@PathVariable UUID sightingId) {
        List<SightingComment> comments = socialService.getComments(sightingId);
        List<Map<String, Object>> response = comments.stream().map(c -> {
            User user = userRepository.findById(c.getUserId()).orElse(null);
            Map<String, Object> map = new HashMap<>();
            map.put("id", c.getId());
            map.put("text", c.getText());
            map.put("userId", c.getUserId());
            map.put("username", user != null ? user.getUsername() : "Unknown");
            map.put("createdAt", c.getCreatedAt().toString());
            return map;
        }).toList();
        return ResponseEntity.ok(response);
    }

    // --- Confirmations ---

    @PostMapping("/sightings/{sightingId}/confirm")
    public ResponseEntity<Map<String, Object>> confirmSighting(
            @RequestAttribute("userId") UUID userId,
            @PathVariable UUID sightingId) {
        socialService.confirmSighting(userId, sightingId);
        long count = socialService.getConfirmationCount(sightingId);
        return ResponseEntity.ok(Map.of("confirmed", true, "totalConfirmations", count));
    }

    @DeleteMapping("/sightings/{sightingId}/confirm")
    public ResponseEntity<Map<String, Object>> removeConfirmation(
            @RequestAttribute("userId") UUID userId,
            @PathVariable UUID sightingId) {
        socialService.removeConfirmation(userId, sightingId);
        long count = socialService.getConfirmationCount(sightingId);
        return ResponseEntity.ok(Map.of("confirmed", false, "totalConfirmations", count));
    }

    @GetMapping("/sightings/{sightingId}/social")
    public ResponseEntity<Map<String, Object>> getSightingSocial(
            @RequestAttribute("userId") UUID userId,
            @PathVariable UUID sightingId) {
        long confirmations = socialService.getConfirmationCount(sightingId);
        boolean userConfirmed = socialService.hasUserConfirmed(userId, sightingId);
        List<SightingComment> comments = socialService.getComments(sightingId);

        List<Map<String, Object>> commentsList = comments.stream().map(c -> {
            User user = userRepository.findById(c.getUserId()).orElse(null);
            Map<String, Object> map = new HashMap<>();
            map.put("id", c.getId());
            map.put("text", c.getText());
            map.put("userId", c.getUserId());
            map.put("username", user != null ? user.getUsername() : "Unknown");
            map.put("createdAt", c.getCreatedAt().toString());
            return map;
        }).toList();

        return ResponseEntity.ok(Map.of(
                "confirmations", confirmations,
                "userConfirmed", userConfirmed,
                "comments", commentsList
        ));
    }

    // --- Regional Feed ---

    @GetMapping("/feed/{regionId}")
    public ResponseEntity<List<Map<String, Object>>> getRegionFeed(
            @PathVariable UUID regionId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        List<Sighting> sightings = socialService.getRegionFeed(regionId, page, size);

        List<Map<String, Object>> feed = sightings.stream().map(s -> {
            User user = userRepository.findById(s.getUserId()).orElse(null);
            Species species = speciesRepository.findById(s.getSpeciesId()).orElse(null);

            Map<String, Object> item = new HashMap<>();
            item.put("sightingId", s.getId());
            item.put("userId", s.getUserId());
            item.put("username", user != null ? user.getUsername() : "Unknown");
            item.put("speciesId", s.getSpeciesId());
            item.put("speciesName", species != null ? (species.getCommonName() != null ? species.getCommonName() : species.getScientificName()) : "Unknown");
            item.put("scientificName", species != null ? species.getScientificName() : null);
            item.put("photoUrl", s.getPhotoUrl());
            item.put("locationName", s.getLocationName());
            item.put("sightedAt", s.getSightedAt().toString());
            item.put("isFirstDiscovery", s.getIsFirstDiscovery());
            item.put("confirmations", socialService.getConfirmationCount(s.getId()));
            return item;
        }).toList();

        return ResponseEntity.ok(feed);
    }
}
