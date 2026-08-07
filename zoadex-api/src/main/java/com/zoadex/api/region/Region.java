package com.zoadex.api.region;

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
import org.locationtech.jts.geom.MultiPolygon;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "regions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Region {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, length = 100)
    private String country;

    @Column(name = "continent")
    private String continent;

    @Column(name = "admin_level")
    private Integer adminLevel;

    @Column(columnDefinition = "geometry(MultiPolygon, 4326)")
    private MultiPolygon boundary;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "species_count")
    @Builder.Default
    private Integer speciesCount = 0;

    @Column(name = "last_synced")
    private LocalDateTime lastSynced;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
