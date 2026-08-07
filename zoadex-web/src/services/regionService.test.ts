import { describe, it, expect, vi, beforeEach } from 'vitest';
import { regionService } from './regionService';
import api from './api';
import { mockRegions } from './mockData';

vi.mock('./api');

const mockedApi = vi.mocked(api);

describe('regionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('returns regions array from API', async () => {
      const apiRegions = [
        { id: 'r1', name: 'Emilia-Romagna', country: 'Italy', centerLatitude: 44.5, centerLongitude: 11.3, totalSpecies: 200 },
        { id: 'r2', name: 'Toscana', country: 'Italy', centerLatitude: 43.7, centerLongitude: 11.2, totalSpecies: 180 },
      ];
      mockedApi.get.mockResolvedValueOnce({ data: apiRegions });

      const result = await regionService.getAll();

      expect(mockedApi.get).toHaveBeenCalledWith('/regions');
      expect(result).toEqual(apiRegions);
    });

    it('falls back to mock data on API failure', async () => {
      mockedApi.get.mockRejectedValueOnce(new Error('Network Error'));

      const result = await regionService.getAll();

      expect(result).toEqual(mockRegions);
    });
  });

  describe('switchRegion', () => {
    it('calls PUT with correct params', async () => {
      mockedApi.put.mockResolvedValueOnce({ data: undefined });

      await regionService.switchRegion('region-42');

      expect(mockedApi.put).toHaveBeenCalledWith('/users/me/region', { regionId: 'region-42' });
    });
  });
});
