package com.zoadex.api.species;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "species")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Species {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "gbif_key", unique = true)
    private Long gbifKey;

    @Column(name = "scientific_name", nullable = false)
    private String scientificName;

    @Column(name = "common_name")
    private String commonName;

    @Column(name = "common_name_local")
    private String commonNameLocal;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 30)
    private SpeciesCategory category;

    @Column(name = "taxonomy_class", length = 100)
    private String taxonomyClass;

    @Column(name = "taxonomy_order", length = 100)
    private String taxonomyOrder;

    @Column(name = "taxonomy_family", length = 100)
    private String taxonomyFamily;

    @Column(name = "iucn_status", length = 20)
    private String iucnStatus;

    @Column(name = "name_it")
    private String nameIt;

    @Column(name = "name_fr")
    private String nameFr;

    @Column(name = "name_es")
    private String nameEs;

    @Column(name = "name_de")
    private String nameDe;

    @Column(name = "name_zh")
    private String nameZh;

    @Column(name = "name_ar")
    private String nameAr;

    @Column(name = "name_ja")
    private String nameJa;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
