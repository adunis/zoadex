package com.zoadex.api.user;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "user_cosmetics")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserCosmetic {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "cosmetic_type", nullable = false, length = 50)
    private String cosmeticType;

    @Column(name = "cosmetic_id", nullable = false, length = 100)
    private String cosmeticId;

    @Builder.Default
    private Boolean equipped = false;
}
