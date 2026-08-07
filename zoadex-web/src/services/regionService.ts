import api from './api';
import { withFallback } from './withFallback';
import { mockRegions } from './mockData';
import { Region } from '../types/region';

export const regionService = {
  async getAll(): Promise<Region[]> {
    return withFallback(
      async () => {
        const response = await api.get<Region[]>('/regions');
        return response.data;
      },
      mockRegions,
    );
  },

  async getMyRegions(): Promise<string[]> {
    try {
      const response = await api.get<string[]>('/users/me/regions');
      return response.data;
    } catch {
      return [];
    }
  },

  async switchRegion(regionId: string): Promise<void> {
    // Don't use withFallback for auth-required mutations
    await api.put('/users/me/region', { regionId });
  },

  async unlockRegion(regionId: string): Promise<void> {
    await api.post(`/users/me/regions/${regionId}`);
  },

  async getBoundary(regionId: string): Promise<[number, number][]> {
    const response = await api.get<{ coordinates: [number, number][] }>(`/regions/${regionId}/boundary`);
    return response.data.coordinates;
  },
};
