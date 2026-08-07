import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../test/utils';
import { HomePage } from './HomePage';

// Mock the map components
vi.mock('../components/map/SightingMap', () => ({
  SightingMap: ({ center }: { center: [number, number] }) => (
    <div data-testid="sighting-map">Map at {center[0]},{center[1]}</div>
  ),
}));

vi.mock('../components/home/WeatherCard', () => ({
  WeatherCard: () => <div data-testid="weather-card" />,
}));

vi.mock('../components/home/CategoryTabs', () => ({
  CategoryTabs: () => <div data-testid="category-tabs" />,
}));

vi.mock('../services/regionService', () => ({
  regionService: {
    getAll: vi.fn().mockResolvedValue([
      { id: 'r1', name: 'Emilia-Romagna', country: 'Italy', centerLatitude: 44.5, centerLongitude: 11.3, totalSpecies: 200 },
    ]),
  },
}));

vi.mock('../services/sightingService', () => ({
  sightingService: {
    getMapPins: vi.fn().mockResolvedValue([]),
  },
}));

describe('HomePage', () => {
  it('renders welcome message', () => {
    renderWithProviders(<HomePage />);

    expect(screen.getByText(/Welcome/)).toBeInTheDocument();
  });

  it('shows "Explorer" when not authenticated', () => {
    renderWithProviders(<HomePage />, { authenticated: false });

    expect(screen.getByText('Welcome, Explorer!')).toBeInTheDocument();
  });

  it('shows username when authenticated', () => {
    renderWithProviders(<HomePage />, { authenticated: true });

    expect(screen.getByText('Welcome, TestUser!')).toBeInTheDocument();
  });

  it('fetches regions and shows region name', async () => {
    renderWithProviders(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('Emilia-Romagna, Italy')).toBeInTheDocument();
    });
  });

  it('renders map without crashing', async () => {
    renderWithProviders(<HomePage />);

    await waitFor(() => {
      expect(screen.getByTestId('sighting-map')).toBeInTheDocument();
    });
  });

  it('shows login hint when not authenticated', () => {
    renderWithProviders(<HomePage />, { authenticated: false });

    expect(screen.getByText(/Login/)).toBeInTheDocument();
    expect(screen.getByText(/track your discoveries/)).toBeInTheDocument();
  });
});
