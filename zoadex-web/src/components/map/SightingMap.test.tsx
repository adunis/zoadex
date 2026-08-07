import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SightingMap } from './SightingMap';
import { SightingPin } from '../../types/map';
import { SpeciesCategory } from '../../types/species';

// Mock react-leaflet components
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="map-container">{children}</div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="marker">{children}</div>
  ),
  Popup: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="popup">{children}</div>
  ),
  useMap: () => ({ setView: vi.fn() }),
}));

vi.mock('leaflet', () => ({
  default: {
    divIcon: vi.fn(() => ({})),
    Icon: { Default: { prototype: {}, mergeOptions: vi.fn() } },
  },
}));

vi.mock('leaflet/dist/leaflet.css', () => ({}));
vi.mock('leaflet/dist/images/marker-icon-2x.png', () => ({ default: '' }));
vi.mock('leaflet/dist/images/marker-icon.png', () => ({ default: '' }));
vi.mock('leaflet/dist/images/marker-shadow.png', () => ({ default: '' }));

// Mock child components
vi.mock('./HeatmapLayer', () => ({
  HeatmapLayer: () => <div data-testid="heatmap-layer" />,
}));

vi.mock('./MapHoverHandler', () => ({
  MapHoverHandler: () => <div data-testid="map-hover-handler" />,
}));

const mockPins: SightingPin[] = [
  {
    id: 'pin-1',
    speciesName: 'Red Fox',
    latitude: 44.5,
    longitude: 11.3,
    dateTime: '2026-08-01T10:00:00Z',
    category: SpeciesCategory.MAMMALS,
    photoUrl: 'https://example.com/fox.jpg',
    notes: 'Seen near the river',
  },
  {
    id: 'pin-2',
    speciesName: 'European Robin',
    latitude: 44.6,
    longitude: 11.4,
    dateTime: '2026-08-02T14:00:00Z',
    category: SpeciesCategory.BIRDS,
  },
];

describe('SightingMap', () => {
  it('renders without crashing with valid center', () => {
    expect(() => {
      render(<SightingMap center={[44.5, 11.3]} pins={[]} />);
    }).not.toThrow();

    expect(screen.getByTestId('map-container')).toBeInTheDocument();
  });

  it('handles undefined center gracefully (does not throw)', () => {
    // Simulate the case where center might come from a potentially-undefined value
    const center = undefined as unknown as [number, number];
    expect(() => {
      render(<SightingMap center={center ?? [0, 0]} pins={[]} />);
    }).not.toThrow();
  });

  it('renders markers for pins', () => {
    render(<SightingMap center={[44.5, 11.3]} pins={mockPins} />);

    const markers = screen.getAllByTestId('marker');
    expect(markers).toHaveLength(2);
  });

  it('shows popup content on marker', () => {
    render(<SightingMap center={[44.5, 11.3]} pins={mockPins} />);

    expect(screen.getByText('Red Fox')).toBeInTheDocument();
    expect(screen.getByText('European Robin')).toBeInTheDocument();
    expect(screen.getByText('Seen near the river')).toBeInTheDocument();
  });

  it('renders with empty pins array', () => {
    render(<SightingMap center={[44.5, 11.3]} pins={[]} />);

    expect(screen.queryByTestId('marker')).not.toBeInTheDocument();
  });

  it('renders heatmap layer when showHeatmap is true', () => {
    render(
      <SightingMap
        center={[44.5, 11.3]}
        pins={mockPins}
        heatmapPoints={[{ latitude: 44.5, longitude: 11.3, intensity: 5 }]}
        showHeatmap={true}
      />,
    );

    expect(screen.getByTestId('heatmap-layer')).toBeInTheDocument();
    // Markers should not render when showHeatmap is true
    expect(screen.queryByTestId('marker')).not.toBeInTheDocument();
  });
});
