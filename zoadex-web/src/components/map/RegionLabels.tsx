import { useMemo } from 'react';
import { Marker } from 'react-leaflet';
import L from 'leaflet';
import { Region } from '../../types/region';
import { getRegionFlagUrl } from '../../utils/regions';

interface RegionLabelsProps {
  regions: Region[];
  currentRegionId?: string;
  onRegionClick: (regionId: string) => void;
}

function createLabelIcon(name: string, country: string): L.DivIcon {
  const flagUrl = getRegionFlagUrl(name, country);
  const flagHtml = flagUrl 
    ? `<img src="${flagUrl}" class="region-label__flag" alt="" loading="lazy" />` 
    : '';
  
  return L.divIcon({
    className: 'region-label-icon',
    html: `<div class="region-label">${flagHtml}<span class="region-label__name">${name}</span></div>`,
    iconSize: [120, 24],
    iconAnchor: [60, 12],
  });
}

export function RegionLabels({ regions, currentRegionId, onRegionClick }: RegionLabelsProps) {
  // Only show regions with GPS data, excluding the current one
  const otherRegions = useMemo(() =>
    regions.filter(r =>
      r.id !== currentRegionId &&
      r.hasGpsData &&
      r.centerLatitude != null &&
      r.centerLongitude != null
    ),
    [regions, currentRegionId]
  );

  return (
    <>
      {otherRegions.map(region => (
        <Marker
          key={region.id}
          position={[region.centerLatitude!, region.centerLongitude!]}
          icon={createLabelIcon(region.name, region.country)}
          eventHandlers={{
            click: () => onRegionClick(region.id),
          }}
        />
      ))}
    </>
  );
}
