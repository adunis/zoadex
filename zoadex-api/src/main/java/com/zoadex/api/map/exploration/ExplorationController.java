package com.zoadex.api.map.exploration;

import com.zoadex.api.common.exception.BadRequestException;
import com.zoadex.api.common.exception.ResourceNotFoundException;
import com.zoadex.api.user.User;
import com.zoadex.api.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/map/exploration")
@RequiredArgsConstructor
public class ExplorationController {

    private final ExploredCellRepository exploredCellRepository;
    private final MapNoteRepository mapNoteRepository;
    private final UserRepository userRepository;

    // --- Explored Grid ---

    @GetMapping("/cells")
    public ResponseEntity<Map<String, Object>> getExploredCells(
            @RequestAttribute("userId") UUID userId,
            @RequestParam UUID regionId) {

        List<ExploredCell> cells = exploredCellRepository.findByUserIdAndRegionId(userId, regionId);
        long totalCells = exploredCellRepository.countByUserIdAndRegionId(userId, regionId);

        List<Map<String, Object>> cellData = cells.stream().map(c -> Map.<String, Object>of(
                "cellX", c.getCellX(),
                "cellY", c.getCellY(),
                "zoomLevel", c.getZoomLevel(),
                "color", c.getColor(),
                "exploredAt", c.getExploredAt().toString()
        )).toList();

        return ResponseEntity.ok(Map.of(
                "cells", cellData,
                "totalExplored", totalCells
        ));
    }

    @PostMapping("/cells")
    @Transactional
    public ResponseEntity<Map<String, Object>> markCellsExplored(
            @RequestAttribute("userId") UUID userId,
            @RequestBody Map<String, Object> body) {

        UUID regionId = UUID.fromString((String) body.get("regionId"));
        String color = (String) body.getOrDefault("color", "#4CAF50");
        int zoomLevel = (int) body.getOrDefault("zoomLevel", 14);

        @SuppressWarnings("unchecked")
        List<Map<String, Integer>> cellList = (List<Map<String, Integer>>) body.get("cells");
        if (cellList == null || cellList.isEmpty()) {
            throw new BadRequestException("No cells provided");
        }
        if (cellList.size() > 500) {
            throw new BadRequestException("Maximum 500 cells per request");
        }

        int added = 0;
        for (Map<String, Integer> cell : cellList) {
            int x = cell.get("x");
            int y = cell.get("y");

            if (!exploredCellRepository.existsByUserIdAndRegionIdAndCellXAndCellYAndZoomLevel(
                    userId, regionId, x, y, zoomLevel)) {
                ExploredCell newCell = ExploredCell.builder()
                        .userId(userId)
                        .regionId(regionId)
                        .cellX(x)
                        .cellY(y)
                        .zoomLevel(zoomLevel)
                        .color(color)
                        .build();
                exploredCellRepository.save(newCell);
                added++;
            }
        }

        long total = exploredCellRepository.countByUserIdAndRegionId(userId, regionId);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "added", added,
                "totalExplored", total
        ));
    }

    @DeleteMapping("/cells")
    @Transactional
    public ResponseEntity<Void> removeCells(
            @RequestAttribute("userId") UUID userId,
            @RequestBody Map<String, Object> body) {

        UUID regionId = UUID.fromString((String) body.get("regionId"));
        int zoomLevel = (int) body.getOrDefault("zoomLevel", 14);

        @SuppressWarnings("unchecked")
        List<Map<String, Integer>> cellList = (List<Map<String, Integer>>) body.get("cells");
        if (cellList != null) {
            for (Map<String, Integer> cell : cellList) {
                exploredCellRepository.deleteCell(userId, regionId, cell.get("x"), cell.get("y"), zoomLevel);
            }
        }
        return ResponseEntity.noContent().build();
    }

    // --- Map Notes ---

    @GetMapping("/notes")
    public ResponseEntity<List<Map<String, Object>>> getMapNotes(
            @RequestAttribute("userId") UUID userId,
            @RequestParam UUID regionId) {

        List<MapNote> notes = mapNoteRepository.findByUserIdAndRegionIdOrderByCreatedAtDesc(userId, regionId);

        List<Map<String, Object>> response = notes.stream().map(n -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", n.getId());
            map.put("latitude", n.getLatitude());
            map.put("longitude", n.getLongitude());
            map.put("title", n.getTitle());
            map.put("text", n.getText());
            map.put("mediaUrl", n.getMediaUrl());
            map.put("mediaType", n.getMediaType());
            map.put("color", n.getColor());
            map.put("icon", n.getIcon());
            map.put("createdAt", n.getCreatedAt().toString());
            return map;
        }).toList();

        return ResponseEntity.ok(response);
    }

    @PostMapping("/notes")
    public ResponseEntity<Map<String, Object>> createMapNote(
            @RequestAttribute("userId") UUID userId,
            @RequestBody Map<String, Object> body) {

        UUID regionId = UUID.fromString((String) body.get("regionId"));
        double latitude = ((Number) body.get("latitude")).doubleValue();
        double longitude = ((Number) body.get("longitude")).doubleValue();
        String title = (String) body.get("title");

        if (title == null || title.isBlank()) {
            throw new BadRequestException("Title is required");
        }

        MapNote note = MapNote.builder()
                .userId(userId)
                .regionId(regionId)
                .latitude(latitude)
                .longitude(longitude)
                .title(title.trim())
                .text((String) body.get("text"))
                .mediaUrl((String) body.get("mediaUrl"))
                .mediaType((String) body.get("mediaType"))
                .color((String) body.getOrDefault("color", "#FF9800"))
                .icon((String) body.getOrDefault("icon", "pin"))
                .build();

        note = mapNoteRepository.save(note);

        Map<String, Object> response = new HashMap<>();
        response.put("id", note.getId());
        response.put("latitude", note.getLatitude());
        response.put("longitude", note.getLongitude());
        response.put("title", note.getTitle());
        response.put("createdAt", note.getCreatedAt().toString());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/notes/{noteId}")
    public ResponseEntity<Map<String, String>> updateMapNote(
            @RequestAttribute("userId") UUID userId,
            @PathVariable UUID noteId,
            @RequestBody Map<String, Object> body) {

        MapNote note = mapNoteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("MapNote", "id", noteId));

        if (!note.getUserId().equals(userId)) {
            throw new BadRequestException("You can only edit your own notes");
        }

        if (body.containsKey("title")) note.setTitle((String) body.get("title"));
        if (body.containsKey("text")) note.setText((String) body.get("text"));
        if (body.containsKey("mediaUrl")) note.setMediaUrl((String) body.get("mediaUrl"));
        if (body.containsKey("mediaType")) note.setMediaType((String) body.get("mediaType"));
        if (body.containsKey("color")) note.setColor((String) body.get("color"));
        if (body.containsKey("icon")) note.setIcon((String) body.get("icon"));

        mapNoteRepository.save(note);
        return ResponseEntity.ok(Map.of("status", "updated"));
    }

    @DeleteMapping("/notes/{noteId}")
    public ResponseEntity<Void> deleteMapNote(
            @RequestAttribute("userId") UUID userId,
            @PathVariable UUID noteId) {

        MapNote note = mapNoteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("MapNote", "id", noteId));

        if (!note.getUserId().equals(userId)) {
            throw new BadRequestException("You can only delete your own notes");
        }

        mapNoteRepository.delete(note);
        return ResponseEntity.noContent().build();
    }
}
