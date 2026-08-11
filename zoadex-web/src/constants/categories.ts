export interface CategoryConfig {
  id: string;
  emoji: string;
  label: string;
}

export const ALL_CATEGORIES: CategoryConfig[] = [
  { id: 'BIRDS', emoji: '🐦', label: 'Birds' },
  { id: 'MAMMALS', emoji: '🐾', label: 'Mammals' },
  { id: 'REPTILES', emoji: '🦎', label: 'Reptiles' },
  { id: 'AMPHIBIANS', emoji: '🐸', label: 'Amphibians' },
  { id: 'INVERTEBRATES', emoji: '🐛', label: 'Invertebrates' },
  { id: 'PLANTS', emoji: '🌿', label: 'Plants' },
  { id: 'TREES', emoji: '🌲', label: 'Trees' },
  { id: 'MUSHROOMS', emoji: '🍄', label: 'Mushrooms' },
  { id: 'FISH', emoji: '🐟', label: 'Fish' },
];

export const ANIMAL_CATEGORIES = ['BIRDS', 'MAMMALS', 'REPTILES', 'AMPHIBIANS', 'FISH', 'INVERTEBRATES'];
export const PLANT_CATEGORIES = ['PLANTS', 'TREES', 'MUSHROOMS'];

export function getCategoryEmoji(category: string): string {
  const found = ALL_CATEGORIES.find(c => c.id === category);
  return found?.emoji ?? '🌍';
}

export function getCategoryLabel(category: string): string {
  const found = ALL_CATEGORIES.find(c => c.id === category);
  return found?.label ?? category;
}

/**
 * Detection radius per category (in degrees, ~km approximate).
 * Determines how far from the map crosshair we look for species.
 */
export const CATEGORY_DETECTION_RADIUS: Record<string, number> = {
  BIRDS:      0.15,   // ~15km - birds fly, spotted at distance
  MAMMALS:    0.08,   // ~8km  - mammals roam but need proximity
  REPTILES:   0.05,   // ~5km  - habitat specific
  AMPHIBIANS: 0.03,   // ~3km  - very habitat-specific (ponds, streams)
  FISH:       0.03,   // ~3km  - tied to specific water bodies
  INVERTEBRATES:    0.03,   // ~3km  - very local
  PLANTS:     0.02,   // ~2km  - fixed location
  TREES:      0.02,   // ~2km  - fixed location
  MUSHROOMS:  0.03,   // ~3km  - very habitat-specific
};

export const DEFAULT_DETECTION_RADIUS = 0.08;

export function getDetectionRadius(category: string): number {
  return CATEGORY_DETECTION_RADIUS[category] ?? DEFAULT_DETECTION_RADIUS;
}
