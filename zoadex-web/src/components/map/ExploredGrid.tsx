import { useEffect, useState, useCallback } from 'react';
import { Rectangle, useMap, useMapEvents } from 'react-leaflet';
import { LatLngBounds } from 'leaflet';
import api from '../../services/api';

interface ExploredCell {
  x: number;
  y: number;
  zoom: number;
}

interface ExploredGridProps {
  regionId: string | null;
  paintMode: boolean;
  onCellPainted?: () => void;
}

const ZOOM_LEVEL = 14;

function tileToLatLng(x: number, y: number, zoom: number): { north: number; south: number; west: number; east: number } {
  const n = Math.pow(2, zoom);
  const west = (x / n) * 360 - 180;
  const east = ((x + 1) / n) * 360 - 180;
  const north = Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n))) * (180 / Math.PI);
  const south = Math.atan(Math.sinh(Math.PI * (1 - (2 * (y + 1)) / n))) * (180 / Math.PI);
  return { north, south, west, east };
}

function latLngToTile(lat: number, lng: number, zoom: number): { x: number; y: number } {
  const n = Math.pow(2, zoom);
  const x = Math.floor(((lng + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n);
  return { x, y };
}

export function ExploredGrid({ regionId, paintMode, onCellPainted }: ExploredGridProps) {
  const [cells, setCells] = useState<ExploredCell[]>([]);
  const map = useMap();

  const fetchCells = useCallback(async () => {
    if (!regionId) return;
    try {
      const response = await api.get<{ cells: { cellX: number; cellY: number; zoomLevel: number }[]; totalExplored: number }>('/map/exploration/cells', {
        params: { regionId },
      });
      setCells(response.data.cells.map(c => ({ x: c.cellX, y: c.cellY, zoom: c.zoomLevel })));
    } catch {
      // ignore fetch errors
    }
  }, [regionId]);

  useEffect(() => {
    fetchCells();
  }, [fetchCells]);

  const paintCell = useCallback(async (lat: number, lng: number) => {
    if (!regionId || !paintMode) return;
    const tile = latLngToTile(lat, lng, ZOOM_LEVEL);
    try {
      await api.post('/map/exploration/cells', {
        regionId,
        cells: [{ x: tile.x, y: tile.y }],
        zoomLevel: ZOOM_LEVEL,
      });
      setCells(prev => {
        const exists = prev.some(c => c.x === tile.x && c.y === tile.y);
        if (exists) return prev;
        return [...prev, { x: tile.x, y: tile.y, zoom: ZOOM_LEVEL }];
      });
      onCellPainted?.();
    } catch {
      // ignore paint errors
    }
  }, [regionId, paintMode, onCellPainted]);

  useMapEvents({
    click(e) {
      if (paintMode) {
        paintCell(e.latlng.lat, e.latlng.lng);
      }
    },
  });

  // Update cursor when paint mode changes
  useEffect(() => {
    const container = map.getContainer();
    if (paintMode) {
      container.style.cursor = 'crosshair';
    } else {
      container.style.cursor = '';
    }
    return () => {
      container.style.cursor = '';
    };
  }, [paintMode, map]);

  return (
    <>
      {cells.map((cell) => {
        const bounds = tileToLatLng(cell.x, cell.y, cell.zoom ?? ZOOM_LEVEL);
        return (
          <Rectangle
            key={`${cell.x}-${cell.y}`}
            bounds={new LatLngBounds(
              [bounds.south, bounds.west],
              [bounds.north, bounds.east],
            )}
            pathOptions={{
              color: '#4CAF50',
              fillColor: '#4CAF50',
              fillOpacity: 0.4,
              weight: 1,
              opacity: 0.6,
            }}
            className="explored-cell"
          />
        );
      })}
    </>
  );
}
