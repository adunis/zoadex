package com.zoadex.api.user;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "user_privacy")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPrivacy {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "show_sightings_on_map", length = 20)
    @Builder.Default
    private String showSightingsOnMap = "APPROXIMATE";

    @Column(name = "profile_visibility", length = 20)
    @Builder.Default
    private String profileVisibility = "PUBLIC";

    @Column(name = "allow_follows", length = 20)
    @Builder.Default
    private String allowFollows = "YES";

    @Column(name = "show_in_leaderboards", length = 20)
    @Builder.Default
    private String showInLeaderboards = "YES";
}
