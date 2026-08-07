package com.zoadex.api.species;

import com.zoadex.api.suggestion.TimeBucket;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.locationtech.jts.geom.Point;

import java.util.UUID;

@Entity
@Table(name = "species_occurrences")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SpeciesOccurrence {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "species_id", nullable = false)
    private UUID speciesId;

    @Column(name = "region_id", nullable = false)
    private UUID regionId;

    @Column(columnDefinition = "geometry(Point, 4326)")
    private Point location;

    private Short month;

    @Enumerated(EnumType.STRING)
    @Column(name = "time_bucket", length = 20)
    private TimeBucket timeBucket;

    @Column(name = "occurrence_count")
    @Builder.Default
    private Integer occurrenceCount = 0;
}
