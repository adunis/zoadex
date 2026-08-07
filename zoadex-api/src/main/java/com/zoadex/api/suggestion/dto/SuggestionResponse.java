package com.zoadex.api.suggestion.dto;

import com.zoadex.api.species.SpeciesCategory;
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
public class SuggestionResponse {

    private UUID speciesId;
    private String commonName;
    private String scientificName;
    private SpeciesCategory category;
    private String thumbnailUrl;
    private double probability;
    private int totalOccurrences;
    private List<String> reasons;
}
