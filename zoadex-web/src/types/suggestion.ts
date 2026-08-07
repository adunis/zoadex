import { SpeciesCategory } from './species';

export interface Suggestion {
  speciesId: string;
  commonName: string | null;
  scientificName: string;
  category: SpeciesCategory;
  thumbnailUrl?: string;
  confidence: number;
  reasons: string[];
}
