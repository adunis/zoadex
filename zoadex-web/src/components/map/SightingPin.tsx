import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { SightingPin as SightingPinType } from '../../types/map';
import { getMacroCategory, SpeciesCategory } from '../../types/species';

function createColoredIcon(color: string): L.DivIcon {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${color};
      width: 24px;
      height: 24px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
  });
}

const categoryIcons: Record<string, L.DivIcon> = {
  PLANTS: createColoredIcon('#66bb6a'),
  ANIMALS: createColoredIcon('#ff7043'),
  MUSHROOMS: createColoredIcon('#ab47bc'),
};

function getIcon(category: SpeciesCategory): L.DivIcon {
  const macro = getMacroCategory(category);
  return categoryIcons[macro] ?? categoryIcons.ANIMALS;
}

interface SightingPinProps {
  pin: SightingPinType;
}

export function SightingPin({ pin }: SightingPinProps) {
  return (
    <Marker position={[pin.latitude, pin.longitude]} icon={getIcon(pin.category)}>
      <Popup>
        <div className="sighting-popup">
          <strong>{pin.speciesName}</strong>
          <p>{getMacroCategory(pin.category)}</p>
          <small>{new Date(pin.dateTime).toLocaleDateString()}</small>
          {pin.notes && <p className="sighting-popup__notes">{pin.notes}</p>}
        </div>
      </Popup>
    </Marker>
  );
}
