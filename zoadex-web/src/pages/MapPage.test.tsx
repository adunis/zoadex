import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test/utils';
import { MapPage } from './MapPage';

// Mock the map component
vi.mock('../components/map/SightingMap', () => ({
  SightingMap: ({ center, showHeatmap }: { center: [number, number]; showHeatmap?: boolean }) => (
    <div data-testid="sighting-map" data-center={`${center[0]},${center[1]}`} data-heatmap={showHeatmap}>
      Map
    </div>
  ),
}));

vi.mock('../services/sightingService', () => ({
  sightingService: {
    getMapPins: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('../services/regionService', () => ({
  regionService: {
    getAll: vi.fn().mockResolvedValue([
      { id: 'r1', name: 'Emilia-Romagna', country: 'Italy', centerLatitude: 44.5, centerLongitude: 11.3 },
    ]),
  },
}));

vi.mock('../services/mapService', () => ({
  mapService: {
    getHeatmapData: vi.fn().mockResolvedValue([]),
    getOccurrencePoints: vi.fn().mockResolvedValue([]),
  },
}));

describe('MapPage', () => {
  it('renders with default center', () => {
    renderWithProviders(<MapPage />);

    const map = screen.getByTestId('sighting-map');
    expect(map).toBeInTheDocument();
    expect(map.getAttribute('data-center')).toBe('44.5,11.3');
  });

  it('renders toggle between "My Sightings" and "Discover"', () => {
    renderWithProviders(<MapPage />);

    expect(screen.getByText(/My Sightings/)).toBeInTheDocument();
    expect(screen.getByText(/Discover/)).toBeInTheDocument();
  });

  it('switches to heatmap view on "Discover" click', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MapPage />);

    const heatmapBtn = screen.getByText(/Discover/);
    await user.click(heatmapBtn);

    expect(heatmapBtn).toHaveAttribute('aria-pressed', 'true');
  });

  it('category filter buttons render all 9 categories in sightings mode', () => {
    renderWithProviders(<MapPage />);

    expect(screen.getByText('🌍 All')).toBeInTheDocument();
    expect(screen.getByText(/Birds/)).toBeInTheDocument();
    expect(screen.getByText(/Mammals/)).toBeInTheDocument();
    expect(screen.getByText(/Reptiles/)).toBeInTheDocument();
    expect(screen.getByText(/Amphibians/)).toBeInTheDocument();
    expect(screen.getByText(/Insects/)).toBeInTheDocument();
    expect(screen.getByText(/Plants/)).toBeInTheDocument();
    expect(screen.getByText(/Trees/)).toBeInTheDocument();
    expect(screen.getByText(/Mushrooms/)).toBeInTheDocument();
    expect(screen.getByText(/Fish/)).toBeInTheDocument();
  });

  it('time range filter buttons render', () => {
    renderWithProviders(<MapPage />);

    expect(screen.getByText('This week')).toBeInTheDocument();
    expect(screen.getByText('This month')).toBeInTheDocument();
    expect(screen.getByText('This year')).toBeInTheDocument();
    expect(screen.getByText('All time')).toBeInTheDocument();
  });

  it('hides category/time filters when in heatmap mode', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MapPage />);

    await user.click(screen.getByText(/Discover/));

    expect(screen.queryByText('🌍 All')).not.toBeInTheDocument();
    expect(screen.queryByText('This week')).not.toBeInTheDocument();
  });
});
