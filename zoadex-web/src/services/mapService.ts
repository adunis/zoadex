import api from './api';
import { withFallback } from './withFallback';
import { mockHeatmapPoints, mockSightingPins } from './mockData';
import { HeatmapPoint, SightingPin } from '../types/map';

export interface OccurrencePoint {
  speciesId: string;
  latitude: number;
  longitude: number;
  occurrenceCount: number;  // total in region = rarity indicator
  clusterSize: number;      // how many sightings in this cluster
  radiusKm: number;         // cluster radius
}

export const mapService = {
  async getHeatmapData(regionId: string, bbox?: string, month?: number): Promise<HeatmapPoint[]> {
    return withFallback(
      async () => {
        const params = new URLSearchParams({ regionId });
        if (bbox) params.append('bbox', bbox);
        if (month !== undefined) params.append('month', month.toString());
        const response = await api.get<HeatmapPoint[]>(`/map/heatmap?${params.toString()}`);
        return response.data;
      },
      mockHeatmapPoints,
    );
  },

  async getOccurrencePoints(regionId: string, categories: string[], limit = 3000): Promise<OccurrencePoint[]> {
    try {
      const params = new URLSearchParams({ regionId, limit: String(limit) });
      for (const cat of categories) params.append('categories', cat);
      const response = await api.get<OccurrencePoint[]>(`/map/occurrence-points?${params.toString()}`);
      return response.data;
    } catch {
      return [];
    }
  },

  async getSightingPins(bbox?: string): Promise<SightingPin[]> {
    return withFallback(
      async () => {
        const params = bbox ? `?bbox=${bbox}` : '';
        const response = await api.get<SightingPin[]>(`/sightings/map${params}`);
        return response.data;
      },
      mockSightingPins,
    );
  },
};
