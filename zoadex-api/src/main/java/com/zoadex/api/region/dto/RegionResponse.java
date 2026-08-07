package com.zoadex.api.region.dto;

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
public class RegionResponse {

    private UUID id;
    private String name;
    private String description;
    private String country;
    private String continent;
    private Integer adminLevel;
    private Integer speciesCount;
    private LocalDateTime lastSynced;
    private Double centerLatitude;
    private Double centerLongitude;
    private String dataTier;
    private boolean hasGpsData;
}
