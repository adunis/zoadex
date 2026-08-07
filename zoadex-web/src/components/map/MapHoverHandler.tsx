import { useEffect, useCallback } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import { HeatmapPoint } from '../../types/map';
import { getDetectionRadius } from '../../constants/categories';

interface MapHoverHandlerProps {
  points: HeatmapPoint[];
  onSpeciesAtCursor: (speciesIds: string[]) => void;
  enabled: boolean;
  speciesLookup?: Map<string, { commonName: string | null; scientificName: string; category: string; thumbnailUrl?: string; occurrenceCount?: number; nameIt?: string | null; nameFr?: string | null; nameEs?: string | null; nameDe?: string | null; nameZh?: string | null; nameAr?: string | null; nameJa?: string | null }>;
}

export function MapHoverHandler({ points, onSpeciesAtCursor, enabled, speciesLookup }: MapHoverHandlerProps) {
  const map = useMap();

  const updateSpeciesAtCenter = useCallback(() => {
    if (!enabled || points.length === 0) {
      onSpeciesAtCursor([]);
      return;
    }
    const center = map.getCenter();
    const zoom = map.getZoom();
    const nearby = findSpeciesNear(points, center.lat, center.lng, zoom, speciesLookup);
    onSpeciesAtCursor(nearby);
  }, [enabled, points, map, onSpeciesAtCursor, speciesLookup]);

  useMapEvents({
    moveend() { updateSpeciesAtCenter(); },
    zoomend() { updateSpeciesAtCenter(); },
  });

  // Fire on mount and when points/enabled change
  useEffect(() => {
    // Small delay to ensure map is settled
    const timer = setTimeout(updateSpeciesAtCenter, 200);
    return () => clearTimeout(timer);
  }, [updateSpeciesAtCenter]);

  return null;
}

function findSpeciesNear(
  points: HeatmapPoint[],
  lat: number,
  lng: number,
  zoom: number,
  speciesLookup?: Map<string, { category: string }>
): string[] {
  // Scale detection radius by zoom level
  // At zoom 12+: use category-based radius as-is
  // At zoom 10-11: multiply by 2x
  // At zoom 8-9: multiply by 5x
  // At zoom 6-7: multiply by 15x
  // At zoom <6: multiply by 30x
  const zoomScale = zoom >= 12 ? 1
    : zoom >= 10 ? 2
    : zoom >= 8 ? 5
    : zoom >= 6 ? 15
    : 30;

  const nearby = points.filter(p => {
    const category = speciesLookup?.get(p.speciesId ?? '')?.category;
    const baseRadius = getDetectionRadius(category ?? '');
    const radius = baseRadius * zoomScale;
    const dLat = p.latitude - lat;
    const dLng = p.longitude - lng;
    return Math.sqrt(dLat * dLat + dLng * dLng) <= radius;
  });

  const speciesIds = [...new Set(nearby.map(p => p.speciesId).filter(Boolean) as string[])];
  return speciesIds;
}
