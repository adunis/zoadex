package com.zoadex.api.species.dto;

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
public class SpeciesResponse {

    private UUID id;
    private Long gbifKey;
    private String scientificName;
    private String commonName;
    private String commonNameLocal;
    private SpeciesCategory category;
    private String taxonomyClass;
    private String taxonomyOrder;
    private String taxonomyFamily;
    private String iucnStatus;
    private String description;
    private String thumbnailUrl;
    private Integer occurrenceCount;
    private List<SpeciesImageResponse> images;
}
