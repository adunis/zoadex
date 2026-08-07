export type Rarity = 'VERY_COMMON' | 'COMMON' | 'UNCOMMON' | 'RARE';

/**
 * Compute rarity relative to all species in the region.
 * Uses percentile-based approach:
 * - Top 15% by occurrence count = VERY_COMMON
 * - Next 35% = COMMON
 * - Next 30% = UNCOMMON
 * - Bottom 20% = RARE
 */
export function computeRarityThresholds(allOccurrenceCounts: number[]): {
  veryCommon: number;
  common: number;
  uncommon: number;
} {
  if (allOccurrenceCounts.length === 0) {
    return { veryCommon: 10000, common: 1000, uncommon: 100 };
  }
  const sorted = [...allOccurrenceCounts].filter(c => c > 0).sort((a, b) => a - b);
  if (sorted.length === 0) {
    return { veryCommon: 10000, common: 1000, uncommon: 100 };
  }
  const p = (pct: number) => sorted[Math.floor(sorted.length * pct)] ?? sorted[sorted.length - 1];
  return {
    uncommon: p(0.20),   // bottom 20% = RARE, above = UNCOMMON
    common: p(0.50),     // bottom 50% = UNCOMMON, above = COMMON
    veryCommon: p(0.85), // top 15% = VERY_COMMON
  };
}

/**
 * Get rarity given a species' occurrence count and the region's thresholds.
 */
export function getRarity(
  occurrenceCount?: number | null,
  thresholds?: { veryCommon: number; common: number; uncommon: number }
): Rarity {
  const count = occurrenceCount ?? 0;
  const t = thresholds ?? { veryCommon: 10000, common: 1000, uncommon: 100 };
  if (count >= t.veryCommon) return 'VERY_COMMON';
  if (count >= t.common) return 'COMMON';
  if (count >= t.uncommon) return 'UNCOMMON';
  return 'RARE';
}

export function getRarityLabel(
  occurrenceCount?: number | null,
  thresholds?: { veryCommon: number; common: number; uncommon: number }
): string {
  switch (getRarity(occurrenceCount, thresholds)) {
    case 'VERY_COMMON': return '🟢 Very Common';
    case 'COMMON': return '🟢 Common';
    case 'UNCOMMON': return '🟡 Uncommon';
    case 'RARE': return '✨ Rare';
  }
}

export function getRarityClass(
  occurrenceCount?: number | null,
  thresholds?: { veryCommon: number; common: number; uncommon: number }
): string {
  switch (getRarity(occurrenceCount, thresholds)) {
    case 'VERY_COMMON': return '';
    case 'COMMON': return '';
    case 'UNCOMMON': return 'map-species-icon--uncommon';
    case 'RARE': return 'map-species-icon--rare';
  }
}

export function matchesRarityFilter(
  occurrenceCount: number | undefined,
  filter: string,
  thresholds?: { veryCommon: number; common: number; uncommon: number }
): boolean {
  if (filter === 'ALL') return true;
  const rarity = getRarity(occurrenceCount, thresholds);
  switch (filter) {
    case 'RARE': return rarity === 'RARE';
    case 'UNCOMMON': return rarity === 'UNCOMMON';
    case 'COMMON': return rarity === 'COMMON' || rarity === 'VERY_COMMON';
    default: return true;
  }
}
