import { describe, it, expect, vi, beforeEach } from 'vitest';
import { speciesService } from './speciesService';
import api from './api';
import { SpeciesCategory } from '../types/species';
import { mockSpecies } from './mockData';

vi.mock('./api');

const mockedApi = vi.mocked(api);

describe('speciesService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getByRegion', () => {
    it('extracts .content from paginated API response', async () => {
      const apiSpecies = [
        {
          id: 'sp-100',
          commonName: 'Test Bird',
          scientificName: 'Testus birdus',
          category: SpeciesCategory.BIRDS,
          images: [],
          regionId: 'region-1',
        },
      ];

      mockedApi.get.mockResolvedValueOnce({
        data: {
          content: apiSpecies,
          totalElements: 1,
          totalPages: 1,
          size: 2000,
          number: 0,
          first: true,
          last: true,
        },
      });

      const result = await speciesService.getByRegion('region-1');

      expect(mockedApi.get).toHaveBeenCalledWith(
        expect.stringContaining('/species?'),
      );
      expect(result.species).toEqual(apiSpecies);
      expect(result.total).toBe(1);
    });

    it('falls back to mock data on API error', async () => {
      mockedApi.get.mockRejectedValueOnce(new Error('Network Error'));

      const result = await speciesService.getByRegion('region-1');

      expect(result.species).toEqual(mockSpecies);
      expect(result.total).toBe(mockSpecies.length);
    });
  });

  describe('search', () => {
    it('handles species with null commonName in fallback filtering', async () => {
      mockedApi.get.mockRejectedValueOnce(new Error('Network Error'));

      // Should not crash even though some mock species might have null names
      const result = await speciesService.search('fox', 'region-1');

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
