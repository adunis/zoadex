package com.zoadex.api.map;

import com.zoadex.api.map.dto.HeatmapPoint;
import com.zoadex.api.sighting.SightingRepository;
import com.zoadex.api.species.SpeciesOccurrence;
import com.zoadex.api.species.SpeciesOccurrenceRepository;
import com.zoadex.api.species.SpeciesRepository;
import com.zoadex.api.suggestion.TimeBucket;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MapServiceTest {

    @Mock
    private SpeciesOccurrenceRepository occurrenceRepository;

    @Mock
    private SightingRepository sightingRepository;

    @Mock
    private SpeciesRepository speciesRepository;

    @InjectMocks
    private MapService mapService;

    private static final GeometryFactory GF = new GeometryFactory(new PrecisionModel(), 4326);

    private Point createPoint(double lon, double lat) {
        return GF.createPoint(new Coordinate(lon, lat));
    }

    @Test
    void getHeatmapData_aggregatesOccurrencesIntoGridCells() {
        UUID regionId = UUID.randomUUID();
        UUID speciesId = UUID.randomUUID();

        SpeciesOccurrence occ1 = SpeciesOccurrence.builder()
                .id(UUID.randomUUID())
                .speciesId(speciesId)
                .regionId(regionId)
                .location(createPoint(10.005, 45.005))
                .month((short) 6)
                .timeBucket(TimeBucket.MORNING)
                .occurrenceCount(3)
                .build();

        SpeciesOccurrence occ2 = SpeciesOccurrence.builder()
                .id(UUID.randomUUID())
                .speciesId(speciesId)
                .regionId(regionId)
                .location(createPoint(10.008, 45.008))
                .month((short) 6)
                .timeBucket(TimeBucket.MORNING)
                .occurrenceCount(2)
                .build();

        when(occurrenceRepository.findByRegionId(regionId)).thenReturn(List.of(occ1, occ2));

        List<HeatmapPoint> result = mapService.getHeatmapData(regionId, null, null, null, null, null);

        assertThat(result).hasSize(1);
        assertThat(result.getFirst().getIntensity()).isEqualTo(5);
        assertThat(result.getFirst().getSpeciesId()).isEqualTo(speciesId);
    }

    @Test
    void getHeatmapData_filtersByBoundingBox() {
        UUID regionId = UUID.randomUUID();
        UUID speciesId = UUID.randomUUID();

        SpeciesOccurrence insideBbox = SpeciesOccurrence.builder()
                .id(UUID.randomUUID())
                .speciesId(speciesId)
                .regionId(regionId)
                .location(createPoint(10.5, 45.5))
                .occurrenceCount(1)
                .build();

        SpeciesOccurrence outsideBbox = SpeciesOccurrence.builder()
                .id(UUID.randomUUID())
                .speciesId(speciesId)
                .regionId(regionId)
                .location(createPoint(20.0, 50.0))
                .occurrenceCount(1)
                .build();

        when(occurrenceRepository.findByRegionId(regionId)).thenReturn(List.of(insideBbox, outsideBbox));

        List<HeatmapPoint> result = mapService.getHeatmapData(regionId, 45.0, 10.0, 46.0, 11.0, null);

        assertThat(result).hasSize(1);
    }

    @Test
    void getHeatmapData_filtersByMonth() {
        UUID regionId = UUID.randomUUID();
        UUID speciesId = UUID.randomUUID();

        SpeciesOccurrence juneOcc = SpeciesOccurrence.builder()
                .id(UUID.randomUUID())
                .speciesId(speciesId)
                .regionId(regionId)
                .location(createPoint(10.5, 45.5))
                .month((short) 6)
                .occurrenceCount(1)
                .build();

        when(occurrenceRepository.findByRegionIdAndMonth(regionId, (short) 6)).thenReturn(List.of(juneOcc));

        List<HeatmapPoint> result = mapService.getHeatmapData(regionId, null, null, null, null, 6);

        assertThat(result).hasSize(1);
    }

    @Test
    void getHeatmapData_returnsEmptyListWhenNoOccurrences() {
        UUID regionId = UUID.randomUUID();

        when(occurrenceRepository.findByRegionId(regionId)).thenReturn(Collections.emptyList());

        List<HeatmapPoint> result = mapService.getHeatmapData(regionId, null, null, null, null, null);

        assertThat(result).isEmpty();
    }
}
