package com.zoadex.api.region.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SpeciesSummaryResponse {

    private String id;
    private String commonName;
    private String commonNameLocal;
    private String scientificName;
    private String category;
    private String thumbnailUrl;
    private Integer occurrenceCount;
    private String nameIt;
    private String nameFr;
    private String nameEs;
    private String nameDe;
    private String nameZh;
    private String nameAr;
    private String nameJa;
}
