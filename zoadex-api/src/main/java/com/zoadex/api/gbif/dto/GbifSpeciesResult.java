package com.zoadex.api.gbif.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class GbifSpeciesResult {

    private int offset;
    private int limit;
    private boolean endOfRecords;
    private long count;
    private List<GbifSpecies> results;
    private List<Facet> facets;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class GbifSpecies {
        private Long key;
        private String scientificName;
        private String canonicalName;
        private String vernacularName;
        private String kingdom;
        private String phylum;
        @JsonProperty("class")
        private String clazz;
        private String order;
        private String family;
        private String genus;
        private String species;
        private String rank;
        private String status;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Facet {
        private String field;
        private List<FacetCount> counts;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class FacetCount {
        private String name;
        private long count;
    }
}
