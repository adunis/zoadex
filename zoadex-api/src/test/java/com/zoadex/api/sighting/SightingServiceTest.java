package com.zoadex.api.sighting;

import com.zoadex.api.badge.BadgeEvaluationService;
import com.zoadex.api.sighting.dto.CreateSightingRequest;
import com.zoadex.api.sighting.dto.SightingResponse;
import com.zoadex.api.species.Species;
import com.zoadex.api.species.SpeciesCategory;
import com.zoadex.api.species.SpeciesRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SightingServiceTest {

    @Mock
    private SightingRepository sightingRepository;

    @Mock
    private SpeciesRepository speciesRepository;

    @Mock
    private BadgeEvaluationService badgeEvaluationService;

    @InjectMocks
    private SightingService sightingService;

    @Test
    void createSighting_setsIsFirstDiscoveryTrueForFirstSighting() {
        UUID userId = UUID.randomUUID();
        UUID speciesId = UUID.randomUUID();

        Species species = Species.builder()
                .id(speciesId)
                .scientificName("Parus major")
                .commonName("Great Tit")
                .category(SpeciesCategory.BIRDS)
                .build();

        CreateSightingRequest request = CreateSightingRequest.builder()
                .speciesId(speciesId)
                .sightedAt(LocalDateTime.now())
                .latitude(45.0)
                .longitude(10.0)
                .build();

        when(speciesRepository.findById(speciesId)).thenReturn(Optional.of(species));
        when(sightingRepository.findByUserIdAndSpeciesId(userId, speciesId)).thenReturn(Collections.emptyList());
        when(sightingRepository.save(any(Sighting.class))).thenAnswer(invocation -> {
            Sighting s = invocation.getArgument(0);
            s.setId(UUID.randomUUID());
            return s;
        });

        SightingResponse response = sightingService.createSighting(userId, request);

        assertThat(response.getIsFirstDiscovery()).isTrue();

        ArgumentCaptor<Sighting> captor = ArgumentCaptor.forClass(Sighting.class);
        verify(sightingRepository).save(captor.capture());
        assertThat(captor.getValue().getIsFirstDiscovery()).isTrue();
    }

    @Test
    void createSighting_setsIsFirstDiscoveryFalseForSubsequentSightings() {
        UUID userId = UUID.randomUUID();
        UUID speciesId = UUID.randomUUID();

        Species species = Species.builder()
                .id(speciesId)
                .scientificName("Parus major")
                .commonName("Great Tit")
                .category(SpeciesCategory.BIRDS)
                .build();

        Sighting existingSighting = Sighting.builder()
                .id(UUID.randomUUID())
                .userId(userId)
                .speciesId(speciesId)
                .sightedAt(LocalDateTime.now().minusDays(1))
                .isFirstDiscovery(true)
                .build();

        CreateSightingRequest request = CreateSightingRequest.builder()
                .speciesId(speciesId)
                .sightedAt(LocalDateTime.now())
                .build();

        when(speciesRepository.findById(speciesId)).thenReturn(Optional.of(species));
        when(sightingRepository.findByUserIdAndSpeciesId(userId, speciesId)).thenReturn(List.of(existingSighting));
        when(sightingRepository.save(any(Sighting.class))).thenAnswer(invocation -> {
            Sighting s = invocation.getArgument(0);
            s.setId(UUID.randomUUID());
            return s;
        });

        SightingResponse response = sightingService.createSighting(userId, request);

        assertThat(response.getIsFirstDiscovery()).isFalse();
    }

    @Test
    void createSighting_triggersBadgeEvaluation() {
        UUID userId = UUID.randomUUID();
        UUID speciesId = UUID.randomUUID();

        Species species = Species.builder()
                .id(speciesId)
                .scientificName("Parus major")
                .commonName("Great Tit")
                .category(SpeciesCategory.BIRDS)
                .build();

        CreateSightingRequest request = CreateSightingRequest.builder()
                .speciesId(speciesId)
                .sightedAt(LocalDateTime.now())
                .build();

        when(speciesRepository.findById(speciesId)).thenReturn(Optional.of(species));
        when(sightingRepository.findByUserIdAndSpeciesId(userId, speciesId)).thenReturn(Collections.emptyList());
        when(sightingRepository.save(any(Sighting.class))).thenAnswer(invocation -> {
            Sighting s = invocation.getArgument(0);
            s.setId(UUID.randomUUID());
            return s;
        });

        sightingService.createSighting(userId, request);

        verify(badgeEvaluationService).evaluateAfterSighting(eq(userId), any(Sighting.class));
    }

    @Test
    void getUserSightings_returnsPaginatedResults() {
        UUID userId = UUID.randomUUID();
        UUID speciesId = UUID.randomUUID();
        Pageable pageable = PageRequest.of(0, 10);

        Sighting sighting = Sighting.builder()
                .id(UUID.randomUUID())
                .userId(userId)
                .speciesId(speciesId)
                .sightedAt(LocalDateTime.now())
                .isFirstDiscovery(true)
                .build();

        Species species = Species.builder()
                .id(speciesId)
                .scientificName("Parus major")
                .commonName("Great Tit")
                .category(SpeciesCategory.BIRDS)
                .build();

        Page<Sighting> page = new PageImpl<>(List.of(sighting), pageable, 1);

        when(sightingRepository.findByUserId(userId, pageable)).thenReturn(page);
        when(speciesRepository.findById(speciesId)).thenReturn(Optional.of(species));

        Page<SightingResponse> result = sightingService.getUserSightings(userId, pageable);

        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().getFirst().getSpeciesCommonName()).isEqualTo("Great Tit");
    }
}
