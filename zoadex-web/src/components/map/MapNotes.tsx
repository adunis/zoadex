import { useEffect, useState, useCallback } from 'react';
import { Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { X, Camera } from 'lucide-react';
import api from '../../services/api';

interface MapNote {
  id: string;
  title: string;
  text: string;
  latitude: number;
  longitude: number;
  mediaUrl?: string;
  createdAt: string;
}

interface MapNotesProps {
  regionId: string | null;
  addNoteMode: boolean;
  onNoteAdded?: () => void;
  onOpenNoteForm?: (lat: number, lng: number) => void;
}

const noteIcon = L.divIcon({
  className: 'map-note-marker',
  html: `<div class="map-note-marker__pin">📝</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
});

export function MapNotes({ regionId, addNoteMode, onOpenNoteForm }: MapNotesProps) {
  const [notes, setNotes] = useState<MapNote[]>([]);

  const fetchNotes = useCallback(async () => {
    if (!regionId) return;
    try {
      const response = await api.get<MapNote[]>('/map/exploration/notes', {
        params: { regionId },
      });
      setNotes(response.data);
    } catch {
      // ignore fetch errors
    }
  }, [regionId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  useMapEvents({
    click(e) {
      if (addNoteMode && onOpenNoteForm) {
        onOpenNoteForm(e.latlng.lat, e.latlng.lng);
      }
    },
  });

  // Crosshair cursor in addNote mode
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    if (addNoteMode) {
      container.style.cursor = 'crosshair';
    } else {
      container.style.cursor = '';
    }
    return () => { container.style.cursor = ''; };
  }, [addNoteMode, map]);


  return (
    <>
      {notes.map((note) => (
        <Marker
          key={note.id}
          position={[note.latitude, note.longitude]}
          icon={noteIcon}
        >
          <Popup className="map-note-popup">
            <div className="map-note-popup__content">
              <h4 className="map-note-popup__title">{note.title}</h4>
              <p className="map-note-popup__text">{note.text}</p>
              {note.mediaUrl && (
                <img
                  className="map-note-popup__media"
                  src={note.mediaUrl}
                  alt={note.title}
                />
              )}
              <span className="map-note-popup__date">
                {new Date(note.createdAt).toLocaleDateString()}
              </span>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}

interface MapNoteFormProps {
  latitude: number;
  longitude: number;
  regionId: string;
  onClose: () => void;
  onSubmitted: () => void;
}

export function MapNoteForm({ latitude, longitude, regionId, onClose, onSubmitted }: MapNoteFormProps) {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [mediaUrl] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // file stored as preview
      const reader = new FileReader();
      reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !text.trim()) return;
    setSubmitting(true);
    try {
      await api.post('/map/exploration/notes', {
        regionId,
        title: title.trim(),
        text: text.trim(),
        latitude,
        longitude,
        mediaUrl: photoPreview || mediaUrl.trim() || undefined,
        mediaType: photoPreview ? 'photo' : undefined,
      });
      onSubmitted();
      onClose();
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="map-note-form">
      <div className="map-note-form__backdrop" onClick={onClose} />
      <div className="map-note-form__modal">
        <div className="map-note-form__header">
          <h4>Add Note</h4>
          <button
            type="button"
            className="map-note-form__close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="note-title">Title</label>
            <input
              id="note-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title..."
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="note-text">Text</label>
            <textarea
              id="note-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Your note..."
              rows={3}
              required
            />
          </div>
          <div className="form-group">
            <label className="map-note-form__photo-label">
              <Camera size={16} /> Photo (optional)
            </label>
            <input
              id="note-photo"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoChange}
              className="map-note-form__photo-input"
            />
            {photoPreview && (
              <div className="map-note-form__photo-preview">
                <img src={photoPreview} alt="Preview" />
                <button type="button" onClick={() => { setPhotoPreview(null);  }}>
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
          <p className="map-note-form__coords">
            📍 {latitude.toFixed(4)}, {longitude.toFixed(4)}
          </p>
          <button
            type="submit"
            className="btn btn--primary btn--full"
            disabled={submitting || !title.trim() || !text.trim()}
          >
            {submitting ? 'Saving...' : 'Save Note'}
          </button>
        </form>
      </div>
    </div>
  );
}
