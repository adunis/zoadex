package com.zoadex.api.suggestion;

import com.zoadex.api.region.Region;
import com.zoadex.api.region.RegionRepository;
import com.zoadex.api.species.Species;
import com.zoadex.api.species.SpeciesImage;
import com.zoadex.api.species.SpeciesImageRepository;
import com.zoadex.api.species.SpeciesOccurrence;
import com.zoadex.api.species.SpeciesOccurrenceRepository;
import com.zoadex.api.species.SpeciesRepository;
import com.zoadex.api.suggestion.dto.SuggestionResponse;
import com.zoadex.api.user.User;
import com.zoadex.api.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SuggestionService {

    private final SpeciesOccurrenceRepository occurrenceRepository;
    private final SpeciesRepository speciesRepository;
    private final SpeciesImageRepository speciesImageRepository;
    private final UserRepository userRepository;
    private final RegionRepository regionRepository;

    private static final GeometryFactory GEOMETRY_FACTORY = new GeometryFactory(new PrecisionModel(), 4326);
    private static final double PROXIMITY_RADIUS_DEGREES = 0.2; // ~20km at mid-latitudes

    public List<SuggestionResponse> getSuggestions(UUID userId, Double latitude, Double longitude, LocalDateTime timestamp) {
        UUID regionId;
        if (userId != null) {
            User user = userRepository.findById(userId).orElse(null);
            if (user == null || user.getActiveRegion() == null) {
                return List.of();
            }
            regionId = user.getActiveRegion().getId();
        } else {
            // Without auth, use the first available region as fallback
            regionId = regionRepository.findAll().stream()
                    .map(r -> r.getId())
                    .findFirst()
                    .orElse(null);
            if (regionId == null) {
                return List.of();
            }
        }
        short currentMonth = (short) timestamp.getMonthValue();
        TimeBucket currentTimeBucket = resolveTimeBucket(timestamp.getHour());

        // Get all occurrences in the region
        List<SpeciesOccurrence> allOccurrences = occurrenceRepository.findByRegionId(regionId);

        // Build a weighted scoring map per species
        Map<UUID, ScoringData> speciesScores = new HashMap<>();

        for (SpeciesOccurrence occurrence : allOccurrences) {
            double score = calculateScore(occurrence, latitude, longitude, currentMonth, currentTimeBucket);
            if (score <= 0) {
                continue;
            }

            speciesScores.computeIfAbsent(occurrence.getSpeciesId(), k -> new ScoringData())
                    .addScore(score, occurrence);
        }

        // Build suggestions
        List<SuggestionResponse> suggestions = new ArrayList<>();
        double maxScore = speciesScores.values().stream()
                .mapToDouble(ScoringData::getTotalScore)
                .max()
                .orElse(1.0);

        for (Map.Entry<UUID, ScoringData> entry : speciesScores.entrySet()) {
            Species species = speciesRepository.findById(entry.getKey()).orElse(null);
            if (species == null) continue;

            ScoringData data = entry.getValue();
            double normalizedScore = maxScore > 0 ? data.getTotalScore() / maxScore : 0;
            // Clamp to 0-1
            normalizedScore = Math.min(1.0, Math.max(0.0, normalizedScore));

            String thumbnailUrl = null;
            List<SpeciesImage> images = speciesImageRepository.findBySpeciesId(species.getId());
            if (!images.isEmpty()) {
                thumbnailUrl = images.getFirst().getThumbnailUrl();
            }

            List<String> reasons = buildReasons(data, currentMonth, currentTimeBucket);

            suggestions.add(SuggestionResponse.builder()
                    .speciesId(species.getId())
                    .commonName(species.getCommonName())
                    .scientificName(species.getScientificName())
                    .category(species.getCategory())
                    .thumbnailUrl(thumbnailUrl)
                    .probability(Math.round(normalizedScore * 100.0) / 100.0)
                    .totalOccurrences(data.getOccurrenceCount())
                    .reasons(reasons)
                    .build());
        }

        suggestions.sort(Comparator.comparingDouble(SuggestionResponse::getProbability).reversed());
        return suggestions.stream().limit(20).toList();
    }

    private double calculateScore(SpeciesOccurrence occurrence, Double lat, Double lon,
                                  short currentMonth, TimeBucket currentBucket) {
        double score = 0.0;

        // Proximity score (if location available)
        if (occurrence.getLocation() != null && lat != null && lon != null) {
            double distance = Math.sqrt(
                    Math.pow(occurrence.getLocation().getY() - lat, 2) +
                    Math.pow(occurrence.getLocation().getX() - lon, 2)
            );
            if (distance > PROXIMITY_RADIUS_DEGREES) {
                // Out of range but still give partial credit for same region
                score += 0.1;
            } else {
                score += 1.0 - (distance / PROXIMITY_RADIUS_DEGREES);
            }
        } else {
            // No location data — use base score from occurrence count
            score += 0.3;
        }

        // Month match (strong signal)
        if (occurrence.getMonth() != null && occurrence.getMonth() == currentMonth) {
            score += 2.0;
        } else if (occurrence.getMonth() != null) {
            // Adjacent months get partial credit
            int monthDiff = Math.abs(occurrence.getMonth() - currentMonth);
            if (monthDiff <= 1 || monthDiff >= 11) {
                score += 0.8;
            }
        }

        // Time bucket match
        if (occurrence.getTimeBucket() != null && occurrence.getTimeBucket() == currentBucket) {
            score += 1.0;
        } else if (occurrence.getTimeBucket() != null && isAdjacentBucket(occurrence.getTimeBucket(), currentBucket)) {
            score += 0.4;
        }

        // Occurrence count amplifier
        if (occurrence.getOccurrenceCount() != null && occurrence.getOccurrenceCount() > 0) {
            score *= (1.0 + Math.log10(occurrence.getOccurrenceCount()));
        }

        return score;
    }

    private boolean isAdjacentBucket(TimeBucket a, TimeBucket b) {
        int diff = Math.abs(a.ordinal() - b.ordinal());
        return diff == 1 || diff == TimeBucket.values().length - 1;
    }

    private List<String> buildReasons(ScoringData data, short currentMonth, TimeBucket currentBucket) {
        List<String> reasons = new ArrayList<>();
        if (data.hasMonthMatch(currentMonth)) {
            reasons.add("Commonly seen this month");
        }
        if (data.hasTimeBucketMatch(currentBucket)) {
            reasons.add("Active at this time of day");
        }
        if (data.hasNearbyOccurrences()) {
            reasons.add("Spotted nearby");
        }
        if (data.getOccurrenceCount() > 10) {
            reasons.add("Frequently observed in this area");
        }
        return reasons;
    }

    private TimeBucket resolveTimeBucket(int hour) {
        if (hour >= 5 && hour < 8) return TimeBucket.DAWN;
        if (hour >= 8 && hour < 12) return TimeBucket.MORNING;
        if (hour >= 12 && hour < 17) return TimeBucket.AFTERNOON;
        if (hour >= 17 && hour < 20) return TimeBucket.DUSK;
        return TimeBucket.NIGHT;
    }

    private static class ScoringData {
        private double totalScore = 0;
        private int occurrenceCount = 0;
        private boolean hasNearby = false;
        private final List<Short> months = new ArrayList<>();
        private final List<TimeBucket> timeBuckets = new ArrayList<>();

        void addScore(double score, SpeciesOccurrence occurrence) {
            totalScore += score;
            occurrenceCount += occurrence.getOccurrenceCount() != null ? occurrence.getOccurrenceCount() : 1;
            if (score > 0.5) hasNearby = true;
            if (occurrence.getMonth() != null) months.add(occurrence.getMonth());
            if (occurrence.getTimeBucket() != null) timeBuckets.add(occurrence.getTimeBucket());
        }

        double getTotalScore() { return totalScore; }
        int getOccurrenceCount() { return occurrenceCount; }
        boolean hasNearbyOccurrences() { return hasNearby; }

        boolean hasMonthMatch(short month) {
            return months.contains(month);
        }

        boolean hasTimeBucketMatch(TimeBucket bucket) {
            return timeBuckets.contains(bucket);
        }
    }
}
