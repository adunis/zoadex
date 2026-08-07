package com.zoadex.api.sighting.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpeditionResponse {

    private UUID id;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private String notes;
    private int sightingCount;
    private LocalDateTime createdAt;
}
