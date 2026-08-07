import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SpeciesCard } from './SpeciesCard';
import { Species, SpeciesCategory } from '../../types/species';

function createSpecies(overrides: Partial<Species> = {}): Species {
  return {
    id: 'sp-1',
    commonName: 'Red Fox',
    scientificName: 'Vulpes vulpes',
    category: SpeciesCategory.MAMMALS,
    images: [],
    regionId: 'region-1',
    discovered: false,
    ...overrides,
  };
}

describe('SpeciesCard', () => {
  it('renders with full data (commonName, scientificName, thumbnailUrl)', () => {
    const species = createSpecies({
      commonName: 'Red Fox',
      scientificName: 'Vulpes vulpes',
      thumbnailUrl: 'https://example.com/fox.jpg',
    });

    render(<MemoryRouter><SpeciesCard species={species} /></MemoryRouter>);

    expect(screen.getByText('Red Fox')).toBeInTheDocument();
    expect(screen.getByText('Vulpes vulpes')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://example.com/fox.jpg');
  });

  it('renders scientificName when commonName is null', () => {
    const species = createSpecies({
      commonName: null,
      scientificName: 'Vulpes vulpes',
    });

    render(<MemoryRouter><SpeciesCard species={species} /></MemoryRouter>);

    // The displayed name should fall back to scientificName
    const nameElements = screen.getAllByText('Vulpes vulpes');
    expect(nameElements.length).toBeGreaterThanOrEqual(1);
    const cardButton = screen.getByRole('button', { name: 'Vulpes vulpes' });
    expect(cardButton).toHaveAttribute(
      'aria-label',
      expect.stringContaining('Vulpes vulpes'),
    );
  });

  it('renders placeholder when thumbnailUrl is absent', () => {
    const species = createSpecies({
      thumbnailUrl: undefined,
      images: [],
    });

    render(<MemoryRouter><SpeciesCard species={species} /></MemoryRouter>);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('shows discovered visual state with check icon', () => {
    const species = createSpecies({ discovered: true });

    render(<MemoryRouter><SpeciesCard species={species} /></MemoryRouter>);

    expect(screen.getByRole('button', { name: 'Red Fox - discovered' })).toHaveClass('species-card--discovered');
    expect(screen.getByLabelText('Discovered')).toBeInTheDocument();
  });

  it('shows undiscovered state without check icon', () => {
    const species = createSpecies({ discovered: false });

    render(<MemoryRouter><SpeciesCard species={species} /></MemoryRouter>);

    expect(screen.getByRole('button', { name: 'Red Fox' })).not.toHaveClass('species-card--discovered');
    expect(screen.queryByLabelText('Discovered')).not.toBeInTheDocument();
  });
});
