package com.zoadex.api.region;

import com.zoadex.api.region.dto.CategoryProgress;
import com.zoadex.api.region.dto.ChecklistResponse;
import com.zoadex.api.region.dto.RegionResponse;
import com.zoadex.api.sighting.Sighting;
import com.zoadex.api.sighting.SightingRepository;
import com.zoadex.api.species.Species;
import com.zoadex.api.species.SpeciesCategory;
import com.zoadex.api.species.SpeciesRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RegionServiceTest {

    @Mock
    private RegionRepository regionRepository;

    @Mock
    private RegionSpeciesRepository regionSpeciesRepository;

    @Mock
    private SpeciesRepository speciesRepository;

    @Mock
    private SightingRepository sightingRepository;

    @InjectMocks
    private RegionService regionService;

    @Test
    void getRegionChecklist_returnsCorrectProgressPerCategory() {
        UUID regionId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UUID birdSpeciesId1 = UUID.randomUUID();
        UUID birdSpeciesId2 = UUID.randomUUID();
        UUID mammalSpeciesId = UUID.randomUUID();

        Region region = Region.builder()
                .id(regionId).name("Lombardy").country("IT").speciesCount(3).build();

        RegionSpecies rs1 = RegionSpecies.builder().regionId(regionId).speciesId(birdSpeciesId1).build();
        RegionSpecies rs2 = RegionSpecies.builder().regionId(regionId).speciesId(birdSpeciesId2).build();
        RegionSpecies rs3 = RegionSpecies.builder().regionId(regionId).speciesId(mammalSpeciesId).build();

        Species bird1 = Species.builder().id(birdSpeciesId1).scientificName("Parus major")
                .category(SpeciesCategory.BIRDS).build();
        Species bird2 = Species.builder().id(birdSpeciesId2).scientificName("Corvus corax")
                .category(SpeciesCategory.BIRDS).build();
        Species mammal = Species.builder().id(mammalSpeciesId).scientificName("Vulpes vulpes")
                .category(SpeciesCategory.MAMMALS).build();

        // User discovered bird1 only
        Sighting sighting = Sighting.builder()
                .id(UUID.randomUUID()).userId(userId).speciesId(birdSpeciesId1)
                .sightedAt(LocalDateTime.now()).isFirstDiscovery(true).build();

        when(regionRepository.findById(regionId)).thenReturn(Optional.of(region));
        when(regionSpeciesRepository.findByRegionId(regionId)).thenReturn(List.of(rs1, rs2, rs3));
        when(sightingRepository.findByUserId(userId, Pageable.unpaged()))
                .thenReturn(new PageImpl<>(List.of(sighting)));
        when(speciesRepository.findById(birdSpeciesId1)).thenReturn(Optional.of(bird1));
        when(speciesRepository.findById(birdSpeciesId2)).thenReturn(Optional.of(bird2));
        when(speciesRepository.findById(mammalSpeciesId)).thenReturn(Optional.of(mammal));

        ChecklistResponse result = regionService.getRegionChecklist(regionId, userId);

        assertThat(result.getTotalSpecies()).isEqualTo(3);
        assertThat(result.getDiscoveredSpecies()).isEqualTo(1);

        CategoryProgress birdsProgress = result.getCategories().stream()
                .filter(cp -> cp.getCategory() == SpeciesCategory.BIRDS)
                .findFirst().orElse(null);
        assertThat(birdsProgress).isNotNull();
        assertThat(birdsProgress.getTotalSpecies()).isEqualTo(2);
        assertThat(birdsProgress.getDiscoveredSpecies()).isEqualTo(1);
        assertThat(birdsProgress.getPercentComplete()).isEqualTo(50.0);

        CategoryProgress mammalsProgress = result.getCategories().stream()
                .filter(cp -> cp.getCategory() == SpeciesCategory.MAMMALS)
                .findFirst().orElse(null);
        assertThat(mammalsProgress).isNotNull();
        assertThat(mammalsProgress.getTotalSpecies()).isEqualTo(1);
        assertThat(mammalsProgress.getDiscoveredSpecies()).isEqualTo(0);
        assertThat(mammalsProgress.getPercentComplete()).isEqualTo(0.0);
    }

    @Test
    void getRegionChecklist_countsDiscoveredSpeciesCorrectly() {
        UUID regionId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UUID speciesId1 = UUID.randomUUID();
        UUID speciesId2 = UUID.randomUUID();

        Region region = Region.builder()
                .id(regionId).name("Lombardy").country("IT").speciesCount(2).build();

        RegionSpecies rs1 = RegionSpecies.builder().regionId(regionId).speciesId(speciesId1).build();
        RegionSpecies rs2 = RegionSpecies.builder().regionId(regionId).speciesId(speciesId2).build();

        Species species1 = Species.builder().id(speciesId1).scientificName("Parus major")
                .category(SpeciesCategory.BIRDS).build();
        Species species2 = Species.builder().id(speciesId2).scientificName("Corvus corax")
                .category(SpeciesCategory.BIRDS).build();

        // User discovered both
        Sighting s1 = Sighting.builder()
                .id(UUID.randomUUID()).userId(userId).speciesId(speciesId1)
                .sightedAt(LocalDateTime.now()).isFirstDiscovery(true).build();
        Sighting s2 = Sighting.builder()
                .id(UUID.randomUUID()).userId(userId).speciesId(speciesId2)
                .sightedAt(LocalDateTime.now()).isFirstDiscovery(true).build();
        // Non-first-discovery sighting should not count
        Sighting s3 = Sighting.builder()
                .id(UUID.randomUUID()).userId(userId).speciesId(speciesId1)
                .sightedAt(LocalDateTime.now()).isFirstDiscovery(false).build();

        when(regionRepository.findById(regionId)).thenReturn(Optional.of(region));
        when(regionSpeciesRepository.findByRegionId(regionId)).thenReturn(List.of(rs1, rs2));
        when(sightingRepository.findByUserId(userId, Pageable.unpaged()))
                .thenReturn(new PageImpl<>(List.of(s1, s2, s3)));
        when(speciesRepository.findById(speciesId1)).thenReturn(Optional.of(species1));
        when(speciesRepository.findById(speciesId2)).thenReturn(Optional.of(species2));

        ChecklistResponse result = regionService.getRegionChecklist(regionId, userId);

        assertThat(result.getDiscoveredSpecies()).isEqualTo(2);
        assertThat(result.getOverallProgress()).isEqualTo(100.0);
    }

    @Test
    void getAllRegions_returnsAllRegions() {
        Region region1 = Region.builder()
                .id(UUID.randomUUID()).name("Lombardy").country("IT")
                .adminLevel(2).speciesCount(100).build();
        Region region2 = Region.builder()
                .id(UUID.randomUUID()).name("Veneto").country("IT")
                .adminLevel(2).speciesCount(80).build();

        when(regionRepository.findAll()).thenReturn(List.of(region1, region2));

        List<RegionResponse> result = regionService.getAllRegions();

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getName()).isEqualTo("Lombardy");
        assertThat(result.get(1).getName()).isEqualTo("Veneto");
    }
}
