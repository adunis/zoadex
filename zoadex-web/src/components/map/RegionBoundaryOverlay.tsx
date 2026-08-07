import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';

interface RegionBoundaryOverlayProps {
  boundary?: [number, number][]; // [lat, lng] pairs of the region boundary
}

export function RegionBoundaryOverlay({ boundary }: RegionBoundaryOverlayProps) {
  const map = useMap();

  useEffect(() => {
    if (!boundary || boundary.length === 0) return;

    // World bounds (large rectangle covering everything)
    const worldBounds: L.LatLngExpression[] = [
      [-90, -180], [-90, 180], [90, 180], [90, -180],
    ];

    // The region boundary is the "hole" — must be in reverse winding order
    const hole: L.LatLngExpression[] = boundary.map(([lat, lng]) => [lat, lng]);

    const overlay = L.polygon([worldBounds, hole], {
      color: 'none',
      fillColor: '#555',
      fillOpacity: 0.45,
      interactive: false,
    });

    overlay.addTo(map);

    return () => {
      map.removeLayer(overlay);
    };
  }, [map, boundary]);

  return null;
}
