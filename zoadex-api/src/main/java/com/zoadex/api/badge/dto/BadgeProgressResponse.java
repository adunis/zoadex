package com.zoadex.api.badge.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BadgeProgressResponse {

    private UUID badgeId;
    private String badgeName;
    private String tier;
    private Integer currentProgress;
    private Integer target;
    private double percentComplete;
}
