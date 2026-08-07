package com.zoadex.api.sighting.dto;

import jakarta.validation.constraints.NotNull;
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
public class CreateSightingRequest {

    @NotNull(message = "Species ID is required")
    private UUID speciesId;

    @NotNull(message = "Sighting time is required")
    private LocalDateTime sightedAt;

    private Double latitude;
    private Double longitude;
    private String locationName;
    private String notes;
    private String photoUrl;
    private UUID expeditionId;
}
