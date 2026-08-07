package com.zoadex.api.badge.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserBadgeResponse {

    private UUID badgeId;
    private String badgeName;
    private String badgeDescription;
    private String badgeIconUrl;
    private String category;
    private String tier;
    private LocalDateTime unlockedAt;
}
