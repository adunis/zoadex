import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { ChecklistPage } from './ChecklistPage';
import { SpeciesCategory } from '../types/species';
import type { Species } from '../types/species';

// Mock services
vi.mock('../services/speciesService', () => ({
  speciesService: {
    getByRegion: vi.fn(),
  },
}));

vi.mock('../services/regionService', () => ({
  regionService: {
    getAll: vi.fn().mockResolvedValue([
      { id: 'region-1', name: 'Emilia-Romagna', country: 'Italy', centerLatitude: 44.5, centerLongitude: 11.3, totalSpecies: 100 },
    ]),
  },
}));

vi.mock('../services/sightingService', () => ({
  sightingService: {
    getByUser: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ isAuthenticated: true, user: { id: 'u1', username: 'Test' }, isLoading: false }),
}));

import { speciesService } from '../services/speciesService';

const mockedSpeciesService = vi.mocked(speciesService);

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
}

function renderChecklistPage() {
  const queryClient = createQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ChecklistPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const speciesWithNullName: Species[] = [
  {
    id: 'sp-1',
    commonName: null,
    scientificName: 'Vulpes vulpes',
    category: SpeciesCategory.MAMMALS,
    images: [],
    regionId: 'region-1',
    discovered: false,
  },
  {
    id: 'sp-2',
    commonName: 'European Robin',
    scientificName: 'Erithacus rubecula',
    category: SpeciesCategory.BIRDS,
    images: [],
    regionId: 'region-1',
    discovered: true,
    discoveredAt: '2026-08-01',
  },
  {
    id: 'sp-3',
    commonName: 'Porcini Mushroom',
    scientificName: 'Boletus edulis',
    category: SpeciesCategory.MUSHROOMS,
    images: [],
    regionId: 'region-1',
    discovered: false,
  },
  {
    id: 'sp-4',
    commonName: 'Stone Pine',
    scientificName: 'Pinus pinea',
    category: SpeciesCategory.TREES,
    images: [],
    regionId: 'region-1',
    discovered: false,
  },
];

describe('ChecklistPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedSpeciesService.getByRegion.mockResolvedValue({
      species: speciesWithNullName,
      total: speciesWithNullName.length,
    });
  });

  it('renders loading state initially', async () => {
    // Species query starts loading after regions are fetched
    mockedSpeciesService.getByRegion.mockReturnValue(new Promise(() => {}));
    renderChecklistPage();

    // Wait for loading state to appear (regions resolve fast, species stays pending)
    expect(await screen.findByText('Loading species...')).toBeInTheDocument();
  });

  it('shows species cards after data loads', async () => {
    renderChecklistPage();

    const vulpesElements = await screen.findAllByText('Vulpes vulpes');
    expect(vulpesElements.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('European Robin')).toBeInTheDocument();
    expect(screen.getByText('Porcini Mushroom')).toBeInTheDocument();
    expect(screen.getByText('Stone Pine')).toBeInTheDocument();
  });

  it('handles API error state', async () => {
    mockedSpeciesService.getByRegion.mockRejectedValue(new Error('Server Error'));
    renderChecklistPage();

    expect(await screen.findByText('Failed to load species. Please try again.')).toBeInTheDocument();
  });

  it('renders without crashing when species have null commonName', async () => {
    renderChecklistPage();

    // Should show the scientific name as fallback (appears in both name and scientific slots)
    const vulpesElements = await screen.findAllByText('Vulpes vulpes');
    expect(vulpesElements.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('European Robin')).toBeInTheDocument();
  });

  it('sorting works with null names (does not crash)', async () => {
    renderChecklistPage();

    // Wait for render
    const vulpesElements = await screen.findAllByText('Vulpes vulpes');
    expect(vulpesElements.length).toBeGreaterThanOrEqual(1);

    // The default sort is 'name' — it should not crash
    const sortSelect = screen.getByLabelText('Sort:');
    await userEvent.selectOptions(sortSelect, 'name');

    // Still renders without error
    expect(screen.getAllByText('Vulpes vulpes').length).toBeGreaterThanOrEqual(1);
  });

  it('filter by MUSHROOMS category works', async () => {
    renderChecklistPage();

    const vulpesElements = await screen.findAllByText('Vulpes vulpes');
    expect(vulpesElements.length).toBeGreaterThanOrEqual(1);

    // Click on MUSHROOMS filter
    const mushroomButton = screen.getByText('🍄 Mushrooms');
    await userEvent.click(mushroomButton);

    // Should show mushroom species
    expect(screen.getByText('Porcini Mushroom')).toBeInTheDocument();
    // Should not show non-mushroom species
    expect(screen.queryByText('European Robin')).not.toBeInTheDocument();
  });

  it('filter by TREES category shows only trees', async () => {
    renderChecklistPage();

    await screen.findAllByText('Vulpes vulpes');

    const treesButton = screen.getByText('🌲 Trees');
    await userEvent.click(treesButton);

    // Trees category should show only tree species
    expect(screen.getByText('Stone Pine')).toBeInTheDocument();
    // Other species should not show
    expect(screen.queryByText('European Robin')).not.toBeInTheDocument();
    expect(screen.queryByText('Porcini Mushroom')).not.toBeInTheDocument();
  });

  it('filter by MAMMALS category works', async () => {
    renderChecklistPage();

    await screen.findAllByText('Vulpes vulpes');

    const mammalsButton = screen.getByText('🐾 Mammals');
    await userEvent.click(mammalsButton);

    expect(screen.getAllByText('Vulpes vulpes').length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText('European Robin')).not.toBeInTheDocument();
    expect(screen.queryByText('Porcini Mushroom')).not.toBeInTheDocument();
  });

  it('filter by BIRDS category works', async () => {
    renderChecklistPage();

    await screen.findAllByText('Vulpes vulpes');

    const birdsButton = screen.getByText('🐦 Birds');
    await userEvent.click(birdsButton);

    expect(screen.getByText('European Robin')).toBeInTheDocument();
    expect(screen.queryByText('Vulpes vulpes')).not.toBeInTheDocument();
    expect(screen.queryByText('Porcini Mushroom')).not.toBeInTheDocument();
  });

  it('search filters species by commonName', async () => {
    renderChecklistPage();

    await screen.findAllByText('Vulpes vulpes');

    const searchInput = screen.getByLabelText('Search species');
    await userEvent.type(searchInput, 'robin');

    expect(screen.getByText('European Robin')).toBeInTheDocument();
    expect(screen.queryByText('Porcini Mushroom')).not.toBeInTheDocument();
  });

  it('search filters species by scientificName', async () => {
    renderChecklistPage();

    await screen.findAllByText('Vulpes vulpes');

    const searchInput = screen.getByLabelText('Search species');
    await userEvent.type(searchInput, 'vulpes');

    // Should find species by scientific name even when commonName is null
    expect(screen.getAllByText('Vulpes vulpes').length).toBeGreaterThanOrEqual(1);
    // Other species should be filtered out
    expect(screen.queryByText('European Robin')).not.toBeInTheDocument();
  });

  it('sort by name handles null commonName (uses scientificName)', async () => {
    renderChecklistPage();

    await screen.findAllByText('Vulpes vulpes');

    const sortSelect = screen.getByLabelText('Sort:');
    await userEvent.selectOptions(sortSelect, 'name');

    // Species with null commonName should use scientificName in sort
    // All species still rendered — did not crash
    expect(screen.getAllByText('Vulpes vulpes').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('European Robin')).toBeInTheDocument();
  });

  it('species detail view shows on click', async () => {
    renderChecklistPage();

    // Wait for species to load
    await screen.findByText('European Robin');

    // Click the species card button
    const robinCard = screen.getByRole('button', { name: /European Robin - discovered/ });
    await userEvent.click(robinCard);

    // Detail view should show scientific name and category
    expect(screen.getByText('Erithacus rubecula')).toBeInTheDocument();
    expect(screen.getByText('BIRDS')).toBeInTheDocument();
  });

  it('back button works from detail view', async () => {
    renderChecklistPage();

    await screen.findByText('European Robin');

    const robinCard = screen.getByRole('button', { name: /European Robin - discovered/ });
    await userEvent.click(robinCard);

    // Should be in detail view
    expect(screen.getByText('Erithacus rubecula')).toBeInTheDocument();

    // Click back button
    const backButton = screen.getByText('Back');
    await userEvent.click(backButton);

    // Should be back in list view
    expect(screen.getByLabelText('Search species')).toBeInTheDocument();
  });
});
