package com.zoadex.api.sighting;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.locationtech.jts.geom.Point;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "sightings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Sighting {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "species_id", nullable = false)
    private UUID speciesId;

    @Column(name = "sighted_at", nullable = false)
    private LocalDateTime sightedAt;

    @Column(columnDefinition = "geometry(Point, 4326)")
    private Point location;

    @Column(name = "location_name")
    private String locationName;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "photo_url", columnDefinition = "TEXT")
    private String photoUrl;

    @Column(name = "is_first_discovery")
    @Builder.Default
    private Boolean isFirstDiscovery = false;

    @Column(name = "expedition_id")
    private UUID expeditionId;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
