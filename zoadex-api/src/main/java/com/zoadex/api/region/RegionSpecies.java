package com.zoadex.api.region;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.util.UUID;

@Entity
@Table(name = "region_species")
@IdClass(RegionSpecies.RegionSpeciesId.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegionSpecies {

    @Id
    @Column(name = "region_id")
    private UUID regionId;

    @Id
    @Column(name = "species_id")
    private UUID speciesId;

    @Column(name = "occurrence_count")
    @Builder.Default
    private Integer occurrenceCount = 0;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RegionSpeciesId implements Serializable {
        private UUID regionId;
        private UUID speciesId;
    }
}
