import { useState } from 'react';
import { useMapEvents, Popup } from 'react-leaflet';
import { Region } from '../../types/region';
import { CountryFlag } from '../common/CountryFlag';

interface GreyAreaClickHandlerProps {
  boundary?: [number, number][]; // current region boundary
  regions: Region[]; // all regions
  currentRegionId?: string;
  onSwitchRegion: (regionId: string) => void;
}

function isPointInPolygon(lat: number, lng: number, polygon: [number, number][]): boolean {
  // Simple ray-casting algorithm
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [yi, xi] = polygon[i];
    const [yj, xj] = polygon[j];
    if (((yi > lat) !== (yj > lat)) && (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  return inside;
}

export function GreyAreaClickHandler({ boundary, regions, currentRegionId, onSwitchRegion }: GreyAreaClickHandlerProps) {
  const [popup, setPopup] = useState<{ lat: number; lng: number; region: Region } | null>(null);

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;

      // Check if click is inside current region boundary
      if (boundary && boundary.length > 0 && isPointInPolygon(lat, lng, boundary)) {
        // Click inside current region — ignore (let crosshair handle it)
        setPopup(null);
        return;
      }

      // Click is outside current region — find which region it falls in
      // Use simple distance to region center as heuristic
      const candidates = regions.filter(r =>
        r.id !== currentRegionId &&
        r.hasGpsData &&
        r.centerLatitude != null &&
        r.centerLongitude != null
      );

      if (candidates.length === 0) {
        setPopup(null);
        return;
      }

      // Find nearest region center
      let nearest: Region = candidates[0];
      let minDist = Infinity;
      for (const r of candidates) {
        const dLat = r.centerLatitude! - lat;
        const dLng = r.centerLongitude! - lng;
        const dist = dLat * dLat + dLng * dLng;
        if (dist < minDist) {
          minDist = dist;
          nearest = r;
        }
      }

      // Only show if reasonably close (within ~15 degrees)
      if (Math.sqrt(minDist) > 15) {
        setPopup(null);
        return;
      }

      setPopup({ lat, lng, region: nearest });
    },
  });

  if (!popup) return null;

  return (
    <Popup
      position={[popup.lat, popup.lng]}
      eventHandlers={{ remove: () => setPopup(null) }}
    >
      <div className="region-switch-popup">
        <div className="region-switch-popup__header">
          <CountryFlag country={popup.region.country} regionName={popup.region.name} size={24} />
          <span className="region-switch-popup__name">{popup.region.name}</span>
        </div>
        <button
          className="btn btn--small btn--primary region-switch-popup__btn"
          onClick={() => {
            onSwitchRegion(popup.region.id);
            setPopup(null);
          }}
        >
          View {popup.region.name}
        </button>
      </div>
    </Popup>
  );
}
