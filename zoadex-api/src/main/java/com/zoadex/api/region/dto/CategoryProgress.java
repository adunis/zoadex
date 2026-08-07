package com.zoadex.api.region.dto;

import com.zoadex.api.species.SpeciesCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryProgress {

    private SpeciesCategory category;
    private int totalSpecies;
    private int discoveredSpecies;
    private double percentComplete;
}
