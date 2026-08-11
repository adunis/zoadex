import { FormEvent, useState, ChangeEvent, useRef, useEffect } from 'react';
import { MapPin, Calendar, Camera, Compass } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useQuery } from '@tanstack/react-query';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useActiveRegion } from '../../hooks/useActiveRegion';
import { regionService } from '../../services/regionService';
import { Expedition } from '../../types/sighting';

interface SightingFormProps {
  onSubmit: (data: {
    speciesId: string;
    latitude: number;
    longitude: number;
    dateTime: string;
    notes?: string;
    photoUrl?: string;
    photo?: File;
  }) => void;
  speciesOptions: { id: string; name: string }[];  expedition?: Expedition | null;
}

// Inner component that must live inside MapContainer
function DraggableMarker({ position, onPositionChange }: {
  position: [number, number];
  onPositionChange: (lat: number, lng: number) => void;
}) {
  const markerRef = useRef<L.Marker>(null);

  const eventHandlers = {
    dragend() {
      const marker = markerRef.current;
      if (marker) {
        const { lat, lng } = marker.getLatLng();
        onPositionChange(lat, lng);
      }
    },
  };

  // Keep marker in sync when position changes externally (e.g. GPS update)
  useMapEvents({});

  return (
    <Marker
      draggable
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
    />
  );
}

export function SightingForm({ onSubmit, speciesOptions, expedition }: SightingFormProps) {
  const { latitude, longitude, requestLocation, loading: geoLoading } = useGeolocation();
  const { regionCenter, activeRegionId } = useActiveRegion();
  const [speciesId, setSpeciesId] = useState('');
  const [dateTime, setDateTime] = useState(
    new Date().toISOString().slice(0, 16),
  );
  const [notes, setNotes] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [latitudeInput, setLatitudeInput] = useState('');
  const [longitudeInput, setLongitudeInput] = useState('');
  const [locationError, setLocationError] = useState<string | null>(null);

  const { data: boundary } = useQuery({
    queryKey: ['regionBoundary', activeRegionId],
    queryFn: () => regionService.getBoundary(activeRegionId!),
    enabled: !!activeRegionId,
    staleTime: Infinity,
  });

  // Simple bounding box check: is a point within the boundary polygon's bounding box?
  function isWithinBoundary(lat: number, lng: number): boolean {
    if (!boundary || boundary.length === 0) return true; // No boundary data, allow all
    const lats = boundary.map(([bLat]) => bLat);
    const lngs = boundary.map(([, bLng]) => bLng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
  }

  function handleCenterToLocation() {
    setLocationError(null);
    requestLocation();
  }

  // When GPS resolves, validate against region boundary
  useEffect(() => {
    if (latitude != null && longitude != null) {
      if (isWithinBoundary(latitude, longitude)) {
        setLatitudeInput(latitude.toString());
        setLongitudeInput(longitude.toString());
        setLocationError(null);
      } else {
        setLocationError('Your location is outside your active region');
      }
    }
  }, [latitude, longitude]); // eslint-disable-line react-hooks/exhaustive-deps

  const effectiveLat = latitudeInput ? parseFloat(latitudeInput) : (latitude ?? null);
  const effectiveLon = longitudeInput ? parseFloat(longitudeInput) : (longitude ?? null);

  const mapCenter: [number, number] = effectiveLat != null && effectiveLon != null
    ? [effectiveLat, effectiveLon]
    : regionCenter;

  function handleMarkerMove(lat: number, lng: number) {
    setLatitudeInput(lat.toFixed(6));
    setLongitudeInput(lng.toFixed(6));
  }

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const finalSpeciesId = speciesId;
    if (!finalSpeciesId || effectiveLat == null || effectiveLon == null) return;

    // Validate location is within active region
    if (!isWithinBoundary(effectiveLat, effectiveLon)) {
      setLocationError('You can only log sightings within your active region');
      return;
    }

    onSubmit({
      speciesId: finalSpeciesId,
      latitude: effectiveLat,
      longitude: effectiveLon,
      dateTime: new Date(dateTime).toISOString(),
      notes: notes || undefined,
      photoUrl: photoPreview ?? undefined,
      photo: photoFile ?? undefined,
    });
  };

  return (
    <form className="sighting-form" onSubmit={handleSubmit}>
      <div className="form-group">
          <label htmlFor="species-select">Species</label>
          <select
            id="species-select"
            value={speciesId}
            onChange={(e) => setSpeciesId(e.target.value)}
            required
          >
            <option value="">Select a species...</option>
            {speciesOptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
            <div className="form-group">
        <label htmlFor="datetime">
          <Calendar size={16} /> Date &amp; Time
        </label>
        <input
          id="datetime"
          type="datetime-local"
          value={dateTime}
          onChange={(e) => setDateTime(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>
          <MapPin size={16} /> Location
        </label>
        {effectiveLat != null && effectiveLon != null ? (
          <div className="location-display-group">
            <p className="location-display">
              {effectiveLat.toFixed(4)}, {effectiveLon.toFixed(4)}
            </p>
            <div className="location-inputs">
              <input
                type="number"
                step="0.0001"
                placeholder="Latitude"
                value={latitudeInput}
                onChange={(e) => setLatitudeInput(e.target.value)}
                aria-label="Latitude"
              />
              <input
                type="number"
                step="0.0001"
                placeholder="Longitude"
                value={longitudeInput}
                onChange={(e) => setLongitudeInput(e.target.value)}
                aria-label="Longitude"
              />
            </div>
            <div className="sighting-form__location-map">
              <MapContainer
                center={mapCenter}
                zoom={13}
                style={{ height: '200px', width: '100%', borderRadius: '8px' }}
                zoomControl={true}
                scrollWheelZoom={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <DraggableMarker
                  position={mapCenter}
                  onPositionChange={handleMarkerMove}
                />
              </MapContainer>
              <p className="sighting-form__location-map-hint">
                🖐️ Drag the pin to adjust location
              </p>
            </div>
          </div>
        ) : (
          <>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={handleCenterToLocation}
              disabled={geoLoading}
            >
              {geoLoading ? 'Getting location...' : 'Get Current Location'}
            </button>
            {locationError && (
              <p className="sighting-form__location-error">{locationError}</p>
            )}
          </>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any observations..."
          rows={3}
        />
      </div>

      <div className="form-group">
        <label>
          <Camera size={16} /> Photo
        </label>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handlePhotoChange}
        />
        {photoPreview && (
          <div className="photo-preview">
            <img src={photoPreview} alt="Sighting preview" />
          </div>
        )}
      </div>

      {expedition && (
        <div className="form-group sighting-form__expedition">
          <Compass size={16} />
          <span>Linked to expedition: <strong>{expedition.name}</strong></span>
        </div>
      )}

      <button
        type="submit"
        className="btn btn--primary btn--full"
        disabled={!!locationError || !speciesId || effectiveLat == null || effectiveLon == null}
      >
        Log Sighting
      </button>
    </form>
  );
}
