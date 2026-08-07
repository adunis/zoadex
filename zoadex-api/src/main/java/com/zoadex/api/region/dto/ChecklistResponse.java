package com.zoadex.api.region.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChecklistResponse {

    private UUID regionId;
    private String regionName;
    private int totalSpecies;
    private int discoveredSpecies;
    private double overallProgress;
    private List<CategoryProgress> categories;
}
