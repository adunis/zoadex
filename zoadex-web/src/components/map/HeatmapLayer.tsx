import { Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useState } from 'react';
import { HeatmapPoint } from '../../types/map';
import { getCategoryEmoji } from '../../constants/categories';
import { getRarityClass } from '../../utils/rarity';

interface HeatmapLayerProps {
  points: HeatmapPoint[];
  visible: boolean;
  focused?: boolean;
  speciesLookup?: Map<string, { commonName: string | null; scientificName: string; category: string; thumbnailUrl?: string; occurrenceCount?: number; nameIt?: string | null; nameFr?: string | null; nameEs?: string | null; nameDe?: string | null; nameZh?: string | null; nameAr?: string | null; nameJa?: string | null }>;
  sightedSpecies?: Map<string, number>; // speciesId -> sighting count
  rarityThresholds?: { veryCommon: number; common: number; uncommon: number };
}

export function HeatmapLayer({ points, visible, speciesLookup, sightedSpecies, rarityThresholds }: HeatmapLayerProps) {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());

  useMapEvents({
    zoomend() {
      setZoom(map.getZoom());
    },
  });

  if (!visible || points.length === 0) return null;

  // --- Low zoom (<= 9): clusters grouped by fine grid, same 32px icon size ---
  if (zoom <= 9) {
    const BIG_GRID = 0.1; // ~10km cells for more granularity
    type MegaCluster = { count: number; topSpeciesId: string; topCount: number; sumLat: number; sumLon: number; pointCount: number };
    const megaClusters = new Map<string, MegaCluster>();

    for (const p of points) {
      const gridLat = Math.round(p.latitude / BIG_GRID) * BIG_GRID;
      const gridLon = Math.round(p.longitude / BIG_GRID) * BIG_GRID;
      const key = `${gridLat}|${gridLon}`;
      const pts = p.clusterSize ?? 1;
      const existing = megaClusters.get(key);
      if (existing) {
        existing.count += pts;
        existing.sumLat += p.latitude;
        existing.sumLon += p.longitude;
        existing.pointCount += 1;
        if (pts > existing.topCount) {
          existing.topCount = pts;
          existing.topSpeciesId = p.speciesId ?? existing.topSpeciesId;
        }
      } else {
        megaClusters.set(key, {
          count: pts,
          topSpeciesId: p.speciesId ?? '',
          topCount: pts,
          sumLat: p.latitude,
          sumLon: p.longitude,
          pointCount: 1,
        });
      }
    }

    const size = 32;
    return (
      <>
        {[...megaClusters.values()].map((cluster, i) => {
          const info = speciesLookup?.get(cluster.topSpeciesId);
          const thumbnailUrl = info?.thumbnailUrl;
          const emoji = getCategoryEmoji(info?.category ?? '');
          const centLat = cluster.sumLat / cluster.pointCount;
          const centLon = cluster.sumLon / cluster.pointCount;
          const countLabel = cluster.count > 999 ? '999+' : cluster.count;

          const iconHtml = `
            <div class="map-species-icon">
              ${thumbnailUrl
                ? `<img src="${thumbnailUrl}" class="map-species-icon__img" alt="" />`
                : `<span class="map-species-icon__emoji">${emoji}</span>`}
              <span class="map-species-icon__badge">${countLabel}</span>
            </div>`;

          return (
            <Marker
              key={i}
              position={[centLat, centLon]}
              interactive={false}
              icon={L.divIcon({
                className: 'zoadex-map-marker',
                html: iconHtml,
                iconSize: [size, size],
                iconAnchor: [size / 2, size / 2],
              })}
            />
          );
        })}
      </>
    );
  }

  // --- Medium / high zoom (> 9): per-species icon rendering ---
  return (
    <>
      {points.map((point, index) => {
        const speciesInfo = speciesLookup?.get(point.speciesId ?? '');
        const category = speciesInfo?.category ?? '';
        const thumbnailUrl = speciesInfo?.thumbnailUrl;
        const emoji = category ? getCategoryEmoji(category) : '🔍';

        // Rarity class from GBIF occurrence count
        const speciesOccCount = speciesInfo?.occurrenceCount ?? point.intensity;
        const rarityClass = getRarityClass(speciesOccCount, rarityThresholds);

        const clusterSize = point.clusterSize ?? 1;
        const showBadge = clusterSize >= 3; // show count badge for notable clusters

        const sightCount = sightedSpecies?.get(point.speciesId ?? '') ?? 0;
        const sightedBadge = sightCount > 0
          ? `<span class="map-species-icon__sighted">👁${sightCount > 1 ? '×' + sightCount : ''}</span>`
          : '';

        const iconHtml = `
          <div class="map-species-icon ${rarityClass}">
            ${thumbnailUrl
              ? `<img src="${thumbnailUrl}" class="map-species-icon__img" alt="" />`
              : `<span class="map-species-icon__emoji">${emoji}</span>`
            }
            ${showBadge ? `<span class="map-species-icon__badge">${clusterSize > 99 ? '99+' : clusterSize}</span>` : ''}
            ${sightedBadge}
          </div>
        `;

        const icon = L.divIcon({
          className: 'zoadex-map-marker',
          html: iconHtml,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -16],
        });

        return (
          <Marker
            key={`${point.latitude}-${point.longitude}-${index}`}
            position={[point.latitude, point.longitude]}
            icon={icon}
            eventHandlers={{
              click: () => {
                map.setView([point.latitude, point.longitude], map.getZoom());
              },
            }}
          />
        );
      })}
    </>
  );
}
