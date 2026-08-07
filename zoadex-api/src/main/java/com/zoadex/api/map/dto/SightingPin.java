package com.zoadex.api.map.dto;

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
public class SightingPin {

    private UUID sightingId;
    private UUID speciesId;
    private String speciesName;
    private double latitude;
    private double longitude;
    private LocalDateTime sightedAt;
}
