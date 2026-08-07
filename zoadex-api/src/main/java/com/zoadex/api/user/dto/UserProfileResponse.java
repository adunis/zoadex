package com.zoadex.api.user.dto;

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
public class UserProfileResponse {

    private UUID id;
    private String email;
    private String username;
    private String plan;
    private UUID activeRegionId;
    private String activeRegionName;
    private long totalSightings;
    private long uniqueSpeciesDiscovered;
    private LocalDateTime createdAt;
}
