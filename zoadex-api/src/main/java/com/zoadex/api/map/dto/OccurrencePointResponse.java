package com.zoadex.api.map.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OccurrencePointResponse {

    private String speciesId;
    private double latitude;
    private double longitude;

    /** Total occurrences of this species in the region. */
    private int occurrenceCount;

    /** Number of raw occurrence points aggregated into this cluster. */
    private int clusterSize;

    /** Approximate radius of the cluster in kilometres. */
    private double radiusKm;
}
