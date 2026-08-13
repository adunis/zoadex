import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { SightingPin as SightingPinType } from '../../types/map';
import { getMacroCategory } from '../../types/species';
import { HeatmapLayer } from './HeatmapLayer';
import { MapHoverHandler } from './MapHoverHandler';
import { CrosshairMarker } from './CrosshairMarker';
import { RegionBoundaryOverlay } from './RegionBoundaryOverlay';
import { RegionLabels } from './RegionLabels';
import { GreyAreaClickHandler } from './GreyAreaClickHandler';
import { HeatmapPoint } from '../../types/map';
import { Region } from '../../types/region';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon issue with bundlers
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Custom sighting marker: half-white, half-red circle
const sightingIcon = L.divIcon({
  className: 'sighting-marker',
  html: `<div class="sighting-marker__circle"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

interface SightingMapProps {
  center: [number, number];
  zoom?: number;
  pins: SightingPinType[];
  heatmapPoints?: HeatmapPoint[];
  showHeatmap?: boolean;
  focusedSpecies?: boolean;
  onSpeciesAtCursor?: (speciesIds: string[]) => void;
  speciesLookup?: Map<string, { commonName: string | null; scientificName: string; category: string; thumbnailUrl?: string; occurrenceCount?: number; nameIt?: string | null; nameFr?: string | null; nameEs?: string | null; nameDe?: string | null; nameZh?: string | null; nameAr?: string | null; nameJa?: string | null }>;
  sightedSpecies?: Map<string, number>;
  showCrosshair?: boolean;
  showSightingMarkers?: boolean;
  boundary?: [number, number][];
  rarityThresholds?: { veryCommon: number; common: number; uncommon: number };
  regions?: Region[];
  currentRegionId?: string;
  onSwitchRegion?: (regionId: string) => void;
  paintMode?: boolean;
  addNoteMode?: boolean;
  children?: React.ReactNode;
}

function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  const prevCenter = useRef<[number, number]>(center);

  useEffect(() => {
    if (center[0] != null && center[1] != null && !isNaN(center[0]) && !isNaN(center[1])) {
      // Only re-center if the region actually changed (not on every render)
      if (prevCenter.current[0] !== center[0] || prevCenter.current[1] !== center[1]) {
        map.setView(center, zoom);
        prevCenter.current = center;
      }
    }
  }, [map, center, zoom]);

  return null;
}

export function SightingMap({
  center,
  zoom = 10,
  pins,
  heatmapPoints = [],
  showHeatmap = false,
  focusedSpecies = false,
  onSpeciesAtCursor,
  speciesLookup,
  sightedSpecies,
  showCrosshair = false,
  showSightingMarkers = false,
  boundary,
  rarityThresholds,
  regions,
  currentRegionId,
  onSwitchRegion,
  paintMode = false,
  addNoteMode = false,
  children,
}: SightingMapProps) {
  const isToolActive = paintMode || addNoteMode;

  return (
    <div className="sighting-map-wrapper">
      <MapContainer
        center={center}
        zoom={zoom}
        className="sighting-map"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController center={center} zoom={zoom} />
        {boundary && <RegionBoundaryOverlay boundary={boundary} />}
        {regions && onSwitchRegion && !isToolActive && (
          <RegionLabels
            regions={regions}
            currentRegionId={currentRegionId}
            onRegionClick={onSwitchRegion}
          />
        )}
        <HeatmapLayer points={heatmapPoints} visible={showHeatmap} focused={focusedSpecies} speciesLookup={speciesLookup} sightedSpecies={sightedSpecies} rarityThresholds={rarityThresholds} />
        {showHeatmap && onSpeciesAtCursor && (
          <MapHoverHandler
            points={heatmapPoints}
            onSpeciesAtCursor={onSpeciesAtCursor}
            enabled={showHeatmap}
            speciesLookup={speciesLookup}
          />
        )}
        {showSightingMarkers && pins.map((pin) => (
          <Marker
            key={pin.id}
            position={[pin.latitude, pin.longitude]}
            icon={sightingIcon}
          >
            <Popup>
              <div className="sighting-popup">
                <div className="sighting-popup__photo">
                  {pin.photoUrl ? (
                    <img src={pin.photoUrl} alt={pin.speciesName} />
                  ) : (
                    <div className="sighting-popup__placeholder">📷</div>
                  )}
                </div>
                <strong className="sighting-popup__name">{pin.speciesName}</strong>
                <span className="sighting-popup__category">{getMacroCategory(pin.category)}</span>
                <span className="sighting-popup__date">
                  {new Date(pin.dateTime).toLocaleDateString()}
                </span>
                {pin.notes && (
                  <p className="sighting-popup__notes">{pin.notes}</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
        {showCrosshair && <CrosshairMarker />}
        {!isToolActive && regions && onSwitchRegion && boundary && (
          <GreyAreaClickHandler
            boundary={boundary}
            regions={regions}
            currentRegionId={currentRegionId}
            onSwitchRegion={onSwitchRegion}
          />
        )}
        {children}

      </MapContainer>
    </div>
  );
}
