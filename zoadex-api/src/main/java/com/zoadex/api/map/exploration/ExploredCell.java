package com.zoadex.api.map.exploration;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "explored_cells")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExploredCell {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "region_id", nullable = false)
    private UUID regionId;

    @Column(name = "cell_x", nullable = false)
    private int cellX;

    @Column(name = "cell_y", nullable = false)
    private int cellY;

    @Column(name = "zoom_level", nullable = false)
    private int zoomLevel;

    @Column(length = 7)
    @Builder.Default
    private String color = "#4CAF50";

    @Column(name = "explored_at")
    private LocalDateTime exploredAt;

    @PrePersist
    protected void onCreate() {
        this.exploredAt = LocalDateTime.now();
    }
}
