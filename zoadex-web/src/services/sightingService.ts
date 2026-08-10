import api from './api';
import { withFallback } from './withFallback';
import { mockSightings, mockExpedition } from './mockData';
import { CreateSightingRequest, Expedition, Sighting } from '../types/sighting';
import { SightingPin } from '../types/map';
import { PageResponse } from '../types/api';

export const sightingService = {
  async create(data: CreateSightingRequest): Promise<Sighting> {
    const mockNewSighting: Sighting = {
      id: `sig-${Date.now()}`,
      speciesId: data.speciesId,
      speciesName: 'New Sighting',
      speciesCategory: mockSightings[0].speciesCategory,
      userId: 'mock-user-1',
      latitude: data.latitude,
      longitude: data.longitude,
      dateTime: data.dateTime,
      notes: data.notes,
      photoUrl: data.photoUrl,
      verified: false,
      createdAt: new Date().toISOString(),
    };
    return withFallback(
      async () => {
        if (data.photo) {
          const formData = new FormData();
          formData.append('speciesId', data.speciesId);
          formData.append('latitude', String(data.latitude));
          formData.append('longitude', String(data.longitude));
          formData.append('dateTime', data.dateTime);
          if (data.notes) formData.append('notes', data.notes);
          if (data.expeditionId) formData.append('expeditionId', data.expeditionId);
          formData.append('photo', data.photo);
          const response = await api.post<Sighting>('/sightings', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          return response.data;
        }
        const response = await api.post<Sighting>('/sightings', data);
        return response.data;
      },
      mockNewSighting,
    );
  },

  async getByUser(userId?: string): Promise<Sighting[]> {
    try {
      const params = new URLSearchParams({ size: '1000' });
      if (userId) params.append('userId', userId);
      const response = await api.get<PageResponse<Sighting>>(`/sightings?${params.toString()}`);
      return response.data.content;
    } catch {
      return []; // Return empty, not mock data
    }
  },

  async getMapPins(bbox?: string): Promise<SightingPin[]> {
    try {
      const params = bbox ? `?bbox=${bbox}` : '';
      const response = await api.get<SightingPin[]>(`/sightings/map${params}`);
      return response.data;
    } catch {
      return []; // Return empty, not mock data
    }
  },

  async startExpedition(name: string): Promise<Expedition> {
    return withFallback(
      async () => {
        const response = await api.post<Expedition>('/expeditions/start', { name });
        return response.data;
      },
      { ...mockExpedition, name, startedAt: new Date().toISOString(), sightings: [], sightingCount: 0 },
    );
  },

  async endExpedition(id: string): Promise<Expedition> {
    return withFallback(
      async () => {
        const response = await api.put<Expedition>(`/expeditions/${id}/end`);
        return response.data;
      },
      { ...mockExpedition, id, active: false, endedAt: new Date().toISOString() },
    );
  },

  async getActiveExpedition(): Promise<Expedition | null> {
    return withFallback(
      async () => {
        const response = await api.get<Expedition | null>('/expeditions/active');
        return response.data;
      },
      null,
    );
  },
};
