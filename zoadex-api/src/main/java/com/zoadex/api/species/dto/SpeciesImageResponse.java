package com.zoadex.api.species.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SpeciesImageResponse {

    private UUID id;
    private String source;
    private String imageUrl;
    private String thumbnailUrl;
    private String license;
    private String attribution;
}
