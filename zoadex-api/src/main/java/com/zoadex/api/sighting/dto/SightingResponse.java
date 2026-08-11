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
public class SightingResponse {

    private UUID id;
    private UUID speciesId;
    private String speciesCommonName;
    private String speciesScientificName;
    private LocalDateTime sightedAt;
    private Double latitude;
    private Double longitude;
    private String locationName;
    private String notes;
    private String photoUrl;
    private String videoUrl;
    private String mediaType;
    private Boolean isFirstDiscovery;
    private UUID expeditionId;
    private LocalDateTime createdAt;
}
