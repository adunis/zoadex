import api from './api';
import { withFallback } from './withFallback';
import { mockSpecies } from './mockData';
import { Species, SpeciesCategory } from '../types/species';
import { PageResponse } from '../types/api';

export interface SpeciesListResult {
  species: Species[];
  total: number;
}

export interface SpeciesSummary {
  id: string;
  commonName: string | null;
  commonNameLocal?: string | null;
  scientificName: string;
  category: string;
  thumbnailUrl: string | null;
  occurrenceCount: number;
  nameIt?: string | null;
  nameFr?: string | null;
  nameEs?: string | null;
  nameDe?: string | null;
  nameZh?: string | null;
  nameAr?: string | null;
  nameJa?: string | null;
}

const SPECIES_CACHE_KEY = 'zoadex_species_summary_v2';
const SPECIES_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Clear stale cache entries from older versions on module load
['zoadex_species_summary_v1', 'zoadex_species_summary'].forEach((key) => {
  localStorage.removeItem(key);
});

export const speciesService = {
  async getByRegion(regionId: string, category?: SpeciesCategory): Promise<SpeciesListResult> {
    return withFallback(
      async () => {
        const params = new URLSearchParams({ regionId, size: '2000' });
        if (category) params.append('category', category);
        const response = await api.get<PageResponse<Species>>(`/species?${params.toString()}`);
        return { species: response.data.content, total: response.data.totalElements };
      },
      category
        ? { species: mockSpecies.filter((s) => s.category === category), total: mockSpecies.filter((s) => s.category === category).length }
        : { species: mockSpecies, total: mockSpecies.length },
    );
  },

  async getById(id: string): Promise<Species> {
    const fallback = mockSpecies.find((s) => s.id === id) ?? mockSpecies[0];
    return withFallback(
      async () => {
        const response = await api.get<Species>(`/species/${id}`);
        return response.data;
      },
      fallback,
    );
  },

  async search(query: string, regionId: string): Promise<Species[]> {
    const lowerQuery = query.toLowerCase();
    const filteredMock = mockSpecies.filter(
      (s) =>
        (s.commonName ?? '').toLowerCase().includes(lowerQuery) ||
        s.scientificName.toLowerCase().includes(lowerQuery),
    );
    return withFallback(
      async () => {
        const params = new URLSearchParams({
          regionId,
          search: query,
          size: '50',
        });
        const response = await api.get<PageResponse<Species>>(`/species?${params.toString()}`);
        return response.data.content;
      },
      filteredMock,
    );
  },

  async getSummary(regionId: string): Promise<SpeciesSummary[]> {
    // Check browser cache first (24h TTL)
    try {
      const cached = localStorage.getItem(`${SPECIES_CACHE_KEY}_${regionId}`);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached) as { data: SpeciesSummary[]; timestamp: number };
        if (Date.now() - timestamp < SPECIES_CACHE_TTL) {
          return data;
        }
      }
    } catch {
      // ignore cache read errors
    }

    // Fetch fresh data from API
    try {
      const response = await api.get<SpeciesSummary[]>(`/regions/${regionId}/species-summary`);
      const data = response.data;

      // Cache full data including thumbnailUrl (~200KB for ~2500 species, fine for localStorage)
      try {
        const cacheData = data;
        localStorage.setItem(
          `${SPECIES_CACHE_KEY}_${regionId}`,
          JSON.stringify({ data: cacheData, timestamp: Date.now() }),
        );
      } catch {
        // storage full or unavailable — skip caching
      }

      return data;
    } catch {
      return [];
    }
  },
};
