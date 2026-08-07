import { useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { regionService } from '../services/regionService';
import { useAuth } from './useAuth';
import { Region } from '../types/region';
import { getRegionPalette, applyPalette, extractPaletteFromFlag } from '../utils/regionPalettes';

// Default world center (neutral view when no region data is available)
const WORLD_CENTER: [number, number] = [20, 0];

export function useActiveRegion() {
  const { user, isAuthenticated } = useAuth();

  const { data: regions = [] } = useQuery({
    queryKey: ['regions'],
    queryFn: () => regionService.getAll(),
  });

  const activeRegion: Region | undefined = useMemo(() => {
    if (user?.activeRegionId) {
      return regions.find(r => r.id === user.activeRegionId);
    }
    // If not logged in, show first region as preview
    // If logged in but no region set, return undefined (needs selection)
    if (!isAuthenticated && regions.length > 0) {
      return regions[0];
    }
    return undefined;
  }, [regions, user?.activeRegionId, isAuthenticated]);

  const regionCenter: [number, number] = useMemo(() => {
    if (activeRegion?.centerLatitude != null && activeRegion?.centerLongitude != null) {
      return [activeRegion.centerLatitude, activeRegion.centerLongitude];
    }
    return WORLD_CENTER;
  }, [activeRegion]);

  useEffect(() => {
    if (!activeRegion?.name) {
      applyPalette(getRegionPalette(undefined, undefined)); // default
      return;
    }

    // Apply hardcoded immediately (no flash), then async extract from flag
    const hardcoded = getRegionPalette(activeRegion.name, activeRegion.country);
    applyPalette(hardcoded);

    // Then try extracting from flag (may update if different)
    extractPaletteFromFlag(activeRegion.name, activeRegion.country).then(palette => {
      applyPalette(palette);
    });
  }, [activeRegion?.name, activeRegion?.country]);

  return {
    activeRegion,
    regionCenter,
    regions,
    activeRegionId: activeRegion?.id ?? null,
  };
}
