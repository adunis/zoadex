package com.zoadex.api.badge.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BadgeResponse {

    private UUID id;
    private String name;
    private String description;
    private String iconUrl;
    private String category;
    private String tier;
    private Map<String, Object> criteria;
}
