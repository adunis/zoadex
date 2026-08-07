package com.zoadex.api.suggestion;

import com.zoadex.api.region.Region;
import com.zoadex.api.species.Species;
import com.zoadex.api.species.SpeciesCategory;
import com.zoadex.api.species.SpeciesImageRepository;
import com.zoadex.api.species.SpeciesOccurrence;
import com.zoadex.api.species.SpeciesOccurrenceRepository;
import com.zoadex.api.species.SpeciesRepository;
import com.zoadex.api.suggestion.dto.SuggestionResponse;
import com.zoadex.api.user.User;
import com.zoadex.api.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SuggestionServiceTest {

    @Mock
    private SpeciesOccurrenceRepository occurrenceRepository;

    @Mock
    private SpeciesRepository speciesRepository;

    @Mock
    private SpeciesImageRepository speciesImageRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private SuggestionService suggestionService;

    private static final GeometryFactory GF = new GeometryFactory(new PrecisionModel(), 4326);

    private Point createPoint(double lon, double lat) {
        return GF.createPoint(new Coordinate(lon, lat));
    }

    @Test
    void getSuggestions_returnsSpeciesSortedByConfidence() {
        UUID userId = UUID.randomUUID();
        UUID regionId = UUID.randomUUID();
        UUID speciesId1 = UUID.randomUUID();
        UUID speciesId2 = UUID.randomUUID();

        Region region = Region.builder().id(regionId).name("Lombardy").country("IT").build();
        User user = User.builder().id(userId).activeRegion(region).build();

        // Species 1: high score (month match + proximity)
        SpeciesOccurrence occ1 = SpeciesOccurrence.builder()
                .speciesId(speciesId1)
                .regionId(regionId)
                .location(createPoint(10.001, 45.001))
                .month((short) 8)
                .timeBucket(TimeBucket.MORNING)
                .occurrenceCount(5)
                .build();

        // Species 2: lower score (no month match, farther away)
        SpeciesOccurrence occ2 = SpeciesOccurrence.builder()
                .speciesId(speciesId2)
                .regionId(regionId)
                .location(createPoint(10.05, 45.05))
                .month((short) 3)
                .timeBucket(TimeBucket.NIGHT)
                .occurrenceCount(1)
                .build();

        Species species1 = Species.builder()
                .id(speciesId1).scientificName("Parus major").commonName("Great Tit")
                .category(SpeciesCategory.BIRDS).build();
        Species species2 = Species.builder()
                .id(speciesId2).scientificName("Vulpes vulpes").commonName("Red Fox")
                .category(SpeciesCategory.MAMMALS).build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(occurrenceRepository.findByRegionId(regionId)).thenReturn(List.of(occ1, occ2));
        when(speciesRepository.findById(speciesId1)).thenReturn(Optional.of(species1));
        when(speciesRepository.findById(speciesId2)).thenReturn(Optional.of(species2));
        when(speciesImageRepository.findBySpeciesId(speciesId1)).thenReturn(Collections.emptyList());
        when(speciesImageRepository.findBySpeciesId(speciesId2)).thenReturn(Collections.emptyList());

        LocalDateTime augustMorning = LocalDateTime.of(2026, 8, 4, 9, 0);
        List<SuggestionResponse> result = suggestionService.getSuggestions(userId, 45.0, 10.0, augustMorning);

        assertThat(result).hasSize(2);
        assertThat(result.getFirst().getProbability()).isGreaterThanOrEqualTo(result.get(1).getProbability());
        assertThat(result.getFirst().getSpeciesId()).isEqualTo(speciesId1);
    }

    @Test
    void getSuggestions_filtersByProximity() {
        UUID userId = UUID.randomUUID();
        UUID regionId = UUID.randomUUID();
        UUID nearSpeciesId = UUID.randomUUID();
        UUID farSpeciesId = UUID.randomUUID();

        Region region = Region.builder().id(regionId).name("Lombardy").country("IT").build();
        User user = User.builder().id(userId).activeRegion(region).build();

        // Near occurrence (within 0.09 degrees)
        SpeciesOccurrence nearOcc = SpeciesOccurrence.builder()
                .speciesId(nearSpeciesId)
                .regionId(regionId)
                .location(createPoint(10.01, 45.01))
                .month((short) 8)
                .timeBucket(TimeBucket.MORNING)
                .occurrenceCount(1)
                .build();

        // Far occurrence (outside proximity radius)
        SpeciesOccurrence farOcc = SpeciesOccurrence.builder()
                .speciesId(farSpeciesId)
                .regionId(regionId)
                .location(createPoint(11.0, 46.0))
                .month((short) 8)
                .timeBucket(TimeBucket.MORNING)
                .occurrenceCount(1)
                .build();

        Species nearSpecies = Species.builder()
                .id(nearSpeciesId).scientificName("Near sp.").commonName("Near")
                .category(SpeciesCategory.BIRDS).build();
        Species farSpecies = Species.builder()
                .id(farSpeciesId).scientificName("Far sp.").commonName("Far")
                .category(SpeciesCategory.BIRDS).build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(occurrenceRepository.findByRegionId(regionId)).thenReturn(List.of(nearOcc, farOcc));
        when(speciesRepository.findById(nearSpeciesId)).thenReturn(Optional.of(nearSpecies));
        when(speciesRepository.findById(farSpeciesId)).thenReturn(Optional.of(farSpecies));
        when(speciesImageRepository.findBySpeciesId(nearSpeciesId)).thenReturn(Collections.emptyList());
        when(speciesImageRepository.findBySpeciesId(farSpeciesId)).thenReturn(Collections.emptyList());

        LocalDateTime augustMorning = LocalDateTime.of(2026, 8, 4, 9, 0);
        List<SuggestionResponse> result = suggestionService.getSuggestions(userId, 45.0, 10.0, augustMorning);

        // Near species should have higher probability
        assertThat(result.getFirst().getSpeciesId()).isEqualTo(nearSpeciesId);
    }

    @Test
    void getSuggestions_weightsByMonthMatch() {
        UUID userId = UUID.randomUUID();
        UUID regionId = UUID.randomUUID();
        UUID matchingId = UUID.randomUUID();
        UUID nonMatchingId = UUID.randomUUID();

        Region region = Region.builder().id(regionId).name("Lombardy").country("IT").build();
        User user = User.builder().id(userId).activeRegion(region).build();

        // Same location but different months
        SpeciesOccurrence matchMonth = SpeciesOccurrence.builder()
                .speciesId(matchingId)
                .regionId(regionId)
                .location(createPoint(10.01, 45.01))
                .month((short) 8) // matches August
                .timeBucket(TimeBucket.MORNING)
                .occurrenceCount(1)
                .build();

        SpeciesOccurrence noMatchMonth = SpeciesOccurrence.builder()
                .speciesId(nonMatchingId)
                .regionId(regionId)
                .location(createPoint(10.01, 45.01))
                .month((short) 1) // January - no match
                .timeBucket(TimeBucket.MORNING)
                .occurrenceCount(1)
                .build();

        Species matchSpecies = Species.builder()
                .id(matchingId).scientificName("August sp.").commonName("August Bird")
                .category(SpeciesCategory.BIRDS).build();
        Species noMatchSpecies = Species.builder()
                .id(nonMatchingId).scientificName("January sp.").commonName("January Bird")
                .category(SpeciesCategory.BIRDS).build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(occurrenceRepository.findByRegionId(regionId)).thenReturn(List.of(matchMonth, noMatchMonth));
        when(speciesRepository.findById(matchingId)).thenReturn(Optional.of(matchSpecies));
        when(speciesRepository.findById(nonMatchingId)).thenReturn(Optional.of(noMatchSpecies));
        when(speciesImageRepository.findBySpeciesId(matchingId)).thenReturn(Collections.emptyList());
        when(speciesImageRepository.findBySpeciesId(nonMatchingId)).thenReturn(Collections.emptyList());

        LocalDateTime augustMorning = LocalDateTime.of(2026, 8, 4, 9, 0);
        List<SuggestionResponse> result = suggestionService.getSuggestions(userId, 45.0, 10.0, augustMorning);

        assertThat(result).hasSize(2);
        // Month-matching species should rank higher
        assertThat(result.getFirst().getSpeciesId()).isEqualTo(matchingId);
        assertThat(result.getFirst().getProbability()).isGreaterThan(result.get(1).getProbability());
    }
}
