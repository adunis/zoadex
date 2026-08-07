package com.zoadex.api.sighting;

import com.zoadex.api.badge.BadgeEvaluationService;
import com.zoadex.api.common.exception.BadRequestException;
import com.zoadex.api.common.exception.ResourceNotFoundException;
import com.zoadex.api.map.dto.SightingPin;
import com.zoadex.api.region.Region;
import com.zoadex.api.region.RegionRepository;
import com.zoadex.api.sighting.dto.CreateSightingRequest;
import com.zoadex.api.sighting.dto.SightingResponse;
import com.zoadex.api.species.Species;
import com.zoadex.api.species.SpeciesRepository;
import com.zoadex.api.user.User;
import com.zoadex.api.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SightingService {

    private final SightingRepository sightingRepository;
    private final SpeciesRepository speciesRepository;
    private final BadgeEvaluationService badgeEvaluationService;
    private final UserRepository userRepository;
    private final RegionRepository regionRepository;

    private static final GeometryFactory GEOMETRY_FACTORY = new GeometryFactory(new PrecisionModel(), 4326);

    @Transactional
    public SightingResponse createSighting(UUID userId, CreateSightingRequest request) {
        // Check if the sighting location is within the user's active region
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (user.getActiveRegion() != null && request.getLatitude() != null && request.getLongitude() != null) {
            Region region = user.getActiveRegion();
            if (region.getBoundary() != null) {
                // Use PostGIS ST_Contains to check if point is within region boundary
                boolean withinRegion = regionRepository.isPointWithinRegion(
                        region.getId(), request.getLatitude(), request.getLongitude());
                if (!withinRegion) {
                    throw new BadRequestException("Sighting location is outside your active region. You can only log sightings within " + region.getName() + ".");
                }
            }
        }

        Species species = speciesRepository.findById(request.getSpeciesId())
                .orElseThrow(() -> new ResourceNotFoundException("Species", "id", request.getSpeciesId()));

        boolean isFirstDiscovery = sightingRepository
                .findByUserIdAndSpeciesId(userId, request.getSpeciesId()).isEmpty();

        Point location = null;
        if (request.getLatitude() != null && request.getLongitude() != null) {
            location = GEOMETRY_FACTORY.createPoint(
                    new Coordinate(request.getLongitude(), request.getLatitude()));
        }

        Sighting sighting = Sighting.builder()
                .userId(userId)
                .speciesId(request.getSpeciesId())
                .sightedAt(request.getSightedAt())
                .location(location)
                .locationName(request.getLocationName())
                .notes(request.getNotes())
                .photoUrl(request.getPhotoUrl())
                .isFirstDiscovery(isFirstDiscovery)
                .expeditionId(request.getExpeditionId())
                .build();

        sighting = sightingRepository.save(sighting);

        // Evaluate badges after sighting
        badgeEvaluationService.evaluateAfterSighting(userId, sighting);

        return toResponse(sighting, species);
    }

    public Page<SightingResponse> getUserSightings(UUID userId, Pageable pageable) {
        return sightingRepository.findByUserId(userId, pageable)
                .map(sighting -> {
                    Species species = speciesRepository.findById(sighting.getSpeciesId()).orElse(null);
                    return toResponse(sighting, species);
                });
    }

    public List<SightingResponse> getSightingsBySpecies(UUID userId, UUID speciesId) {
        return sightingRepository.findByUserIdAndSpeciesId(userId, speciesId).stream()
                .map(sighting -> {
                    Species species = speciesRepository.findById(sighting.getSpeciesId()).orElse(null);
                    return toResponse(sighting, species);
                })
                .collect(Collectors.toList());
    }

    public List<SightingPin> getSightingsForMap(UUID userId, Double minLat, Double minLon,
                                                Double maxLat, Double maxLon) {
        List<Sighting> sightings = sightingRepository.findByUserId(userId,
                Pageable.unpaged()).getContent();

        return sightings.stream()
                .filter(s -> s.getLocation() != null)
                .filter(s -> {
                    double lat = s.getLocation().getY();
                    double lon = s.getLocation().getX();
                    if (minLat != null && maxLat != null && minLon != null && maxLon != null) {
                        return lat >= minLat && lat <= maxLat && lon >= minLon && lon <= maxLon;
                    }
                    return true;
                })
                .map(s -> {
                    Species species = speciesRepository.findById(s.getSpeciesId()).orElse(null);
                    return SightingPin.builder()
                            .sightingId(s.getId())
                            .speciesId(s.getSpeciesId())
                            .speciesName(species != null ? species.getCommonName() : null)
                            .latitude(s.getLocation().getY())
                            .longitude(s.getLocation().getX())
                            .sightedAt(s.getSightedAt())
                            .build();
                })
                .collect(Collectors.toList());
    }

    public SightingResponse getSightingById(UUID sightingId) {
        Sighting sighting = sightingRepository.findById(sightingId)
                .orElseThrow(() -> new ResourceNotFoundException("Sighting", "id", sightingId));
        Species species = speciesRepository.findById(sighting.getSpeciesId()).orElse(null);
        return toResponse(sighting, species);
    }

    private SightingResponse toResponse(Sighting sighting, Species species) {
        Double lat = sighting.getLocation() != null ? sighting.getLocation().getY() : null;
        Double lon = sighting.getLocation() != null ? sighting.getLocation().getX() : null;

        return SightingResponse.builder()
                .id(sighting.getId())
                .speciesId(sighting.getSpeciesId())
                .speciesCommonName(species != null ? species.getCommonName() : null)
                .speciesScientificName(species != null ? species.getScientificName() : null)
                .sightedAt(sighting.getSightedAt())
                .latitude(lat)
                .longitude(lon)
                .locationName(sighting.getLocationName())
                .notes(sighting.getNotes())
                .photoUrl(sighting.getPhotoUrl())
                .isFirstDiscovery(sighting.getIsFirstDiscovery())
                .expeditionId(sighting.getExpeditionId())
                .createdAt(sighting.getCreatedAt())
                .build();
    }
}
