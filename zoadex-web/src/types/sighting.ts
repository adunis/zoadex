import { SpeciesCategory } from './species';

export interface Sighting {
  id: string;
  speciesId: string;
  speciesName: string;
  speciesCategory: SpeciesCategory;
  userId: string;
  latitude: number;
  longitude: number;
  dateTime: string;
  notes?: string;
  photoUrl?: string;
  verified: boolean;
  createdAt: string;
}

export interface Expedition {
  id: string;
  userId: string;
  name: string;
  startedAt: string;
  endedAt?: string;
  active: boolean;
  sightings: Sighting[];
  sightingCount: number;
  regionId: string;
}

export interface CreateSightingRequest {
  speciesId: string;
  latitude: number;
  longitude: number;
  dateTime: string;
  notes?: string;
  photoUrl?: string;
  photo?: File;
  videoUrl?: string;
  video?: File;
  expeditionId?: string;
}
