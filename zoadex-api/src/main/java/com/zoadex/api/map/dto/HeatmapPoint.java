package com.zoadex.api.map.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HeatmapPoint {

    private double latitude;
    private double longitude;
    private int intensity;
    private UUID speciesId;
}
