import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mapService } from './mapService';
import api from './api';
import { mockHeatmapPoints, mockSightingPins } from './mockData';

vi.mock('./api');

const mockedApi = vi.mocked(api);

describe('mapService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getHeatmapData', () => {
    it('returns HeatmapPoint[] from API', async () => {
      const points = [
        { latitude: 44.5, longitude: 11.3, intensity: 8 },
        { latitude: 44.6, longitude: 11.4, intensity: 3 },
      ];
      mockedApi.get.mockResolvedValueOnce({ data: points });

      const result = await mapService.getHeatmapData('region-1');

      expect(result).toEqual(points);
    });

    it('passes regionId and bbox params correctly', async () => {
      mockedApi.get.mockResolvedValueOnce({ data: [] });

      await mapService.getHeatmapData('region-1', '11.0,44.0,12.0,45.0');

      expect(mockedApi.get).toHaveBeenCalledWith(
        expect.stringContaining('regionId=region-1'),
      );
      expect(mockedApi.get).toHaveBeenCalledWith(
        expect.stringContaining('bbox=11.0%2C44.0%2C12.0%2C45.0'),
      );
    });

    it('passes month param when provided', async () => {
      mockedApi.get.mockResolvedValueOnce({ data: [] });

      await mapService.getHeatmapData('region-1', undefined, 6);

      expect(mockedApi.get).toHaveBeenCalledWith(
        expect.stringContaining('month=6'),
      );
    });

    it('falls back to mock on failure', async () => {
      mockedApi.get.mockRejectedValueOnce(new Error('Network Error'));

      const result = await mapService.getHeatmapData('region-1');

      expect(result).toEqual(mockHeatmapPoints);
    });
  });

  describe('getSightingPins', () => {
    it('returns pins from API', async () => {
      const pins = [
        { id: 'p1', speciesName: 'Fox', latitude: 44.5, longitude: 11.3, dateTime: '2026-08-01', category: 'MAMMALS' },
      ];
      mockedApi.get.mockResolvedValueOnce({ data: pins });

      const result = await mapService.getSightingPins();

      expect(mockedApi.get).toHaveBeenCalledWith('/sightings/map');
      expect(result).toEqual(pins);
    });

    it('passes bbox param when provided', async () => {
      mockedApi.get.mockResolvedValueOnce({ data: [] });

      await mapService.getSightingPins('11.0,44.0,12.0,45.0');

      expect(mockedApi.get).toHaveBeenCalledWith('/sightings/map?bbox=11.0,44.0,12.0,45.0');
    });

    it('falls back to mock on failure', async () => {
      mockedApi.get.mockRejectedValueOnce(new Error('Network Error'));

      const result = await mapService.getSightingPins();

      expect(result).toEqual(mockSightingPins);
    });
  });

  describe('getOccurrencePoints', () => {
    it('returns OccurrencePoint[] from API for a single category', async () => {
      const points = [
        { speciesId: 'sp1', latitude: 44.5, longitude: 11.3, occurrenceCount: 5, clusterSize: 3, radiusKm: 2 },
      ];
      mockedApi.get.mockResolvedValueOnce({ data: points });

      const result = await mapService.getOccurrencePoints('region-1', ['MAMMALS']);

      expect(result).toEqual(points);
      expect(mockedApi.get).toHaveBeenCalledWith(
        expect.stringContaining('categories=MAMMALS'),
      );
    });

    it('appends multiple categories as repeated params', async () => {
      mockedApi.get.mockResolvedValueOnce({ data: [] });

      await mapService.getOccurrencePoints('region-1', ['MAMMALS', 'INVERTEBRATES']);

      expect(mockedApi.get).toHaveBeenCalledWith(
        expect.stringContaining('categories=MAMMALS'),
      );
      expect(mockedApi.get).toHaveBeenCalledWith(
        expect.stringContaining('categories=INVERTEBRATES'),
      );
    });

    it('passes regionId and limit params', async () => {
      mockedApi.get.mockResolvedValueOnce({ data: [] });

      await mapService.getOccurrencePoints('region-1', ['BIRDS'], 500);

      expect(mockedApi.get).toHaveBeenCalledWith(
        expect.stringContaining('regionId=region-1'),
      );
      expect(mockedApi.get).toHaveBeenCalledWith(
        expect.stringContaining('limit=500'),
      );
    });

    it('returns empty array on failure', async () => {
      mockedApi.get.mockRejectedValueOnce(new Error('Network Error'));

      const result = await mapService.getOccurrencePoints('region-1', ['MAMMALS']);

      expect(result).toEqual([]);
    });
  });
});
