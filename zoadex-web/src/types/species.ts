export enum SpeciesCategory {
  MAMMALS = 'MAMMALS',
  BIRDS = 'BIRDS',
  REPTILES = 'REPTILES',
  AMPHIBIANS = 'AMPHIBIANS',
  FISH = 'FISH',
  INSECTS = 'INSECTS',
  TREES = 'TREES',
  PLANTS = 'PLANTS',
  MUSHROOMS = 'MUSHROOMS',
}

export type MacroCategory = 'PLANTS' | 'ANIMALS' | 'MUSHROOMS';

export function getMacroCategory(category: SpeciesCategory): MacroCategory {
  switch (category) {
    case SpeciesCategory.TREES:
    case SpeciesCategory.PLANTS:
      return 'PLANTS';
    case SpeciesCategory.MUSHROOMS:
      return 'MUSHROOMS';
    default:
      return 'ANIMALS';
  }
}

export interface SpeciesImage {
  id: string;
  url: string;
  caption?: string;
  credit?: string;
}

export interface Species {
  id: string;
  commonName: string | null;
  commonNameLocal?: string | null;
  scientificName: string;
  category: SpeciesCategory;
  description?: string;
  habitat?: string;
  thumbnailUrl?: string;
  occurrenceCount?: number;
  images: SpeciesImage[];
  regionId: string;
  discovered?: boolean;
  discoveredAt?: string;
  nameIt?: string | null;
  nameFr?: string | null;
  nameEs?: string | null;
  nameDe?: string | null;
  nameZh?: string | null;
  nameAr?: string | null;
  nameJa?: string | null;
}
