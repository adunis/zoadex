export interface Region {
  id: string;
  name: string;
  description?: string;
  country: string;
  continent?: string;
  adminLevel?: number;
  centerLatitude?: number | null;
  centerLongitude?: number | null;
  totalSpecies?: number;
  speciesCount?: number;
  lastSynced?: string;
  dataTier?: 'MISSING' | 'PARTIAL' | 'BASIC' | 'FULL';
  hasGpsData?: boolean;
}

