package com.zoadex.api.gbif.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class GbifOccurrenceResult {

    private int offset;
    private int limit;
    private boolean endOfRecords;
    private long count;
    private List<GbifOccurrence> results;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class GbifOccurrence {
        private Long key;
        private Long speciesKey;
        private String scientificName;
        private Double decimalLatitude;
        private Double decimalLongitude;
        private String country;
        private String eventDate;
        private Integer month;
        private Integer year;
    }
}
