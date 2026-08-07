import { SpeciesCategory } from './species';

export interface HeatmapPoint {
  latitude: number;
  longitude: number;
  intensity: number;        // maps to occurrenceCount for rarity
  speciesId?: string;
  clusterSize?: number;     // how many observations in this cluster
  radiusKm?: number;
}

export interface SightingPin {
  id: string;
  speciesName: string;
  latitude: number;
  longitude: number;
  dateTime: string;
  category: SpeciesCategory;
  photoUrl?: string;
  notes?: string;
}
