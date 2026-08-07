package com.zoadex.api.user;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_regions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@IdClass(UserRegionId.class)
public class UserRegion {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @Id
    @Column(name = "region_id")
    private UUID regionId;

    @Column(name = "unlocked_at")
    private LocalDateTime unlockedAt;
}
