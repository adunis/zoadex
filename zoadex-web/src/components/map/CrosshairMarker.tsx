import { useEffect, useState, useCallback } from 'react';
import { Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

const crosshairIcon = L.divIcon({
  className: 'crosshair-icon',
  html: '<div class="crosshair-visual"></div>',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

interface CrosshairMarkerProps {
  onPositionChange?: (lat: number, lng: number) => void;
}

export function CrosshairMarker({ onPositionChange }: CrosshairMarkerProps) {
  const map = useMap();
  const [position, setPosition] = useState<[number, number]>([
    map.getCenter().lat,
    map.getCenter().lng,
  ]);

  const updatePosition = useCallback((lat: number, lng: number) => {
    setPosition([lat, lng]);
    onPositionChange?.(lat, lng);
  }, [onPositionChange]);

  useMapEvents({
    move() {
      const c = map.getCenter();
      updatePosition(c.lat, c.lng);
    },
  });

  useEffect(() => {
    const c = map.getCenter();
    updatePosition(c.lat, c.lng);
  }, [map, updatePosition]);

  return (
    <Marker
      position={position}
      icon={crosshairIcon}
      interactive={false}
      zIndexOffset={10000}
    />
  );
}
