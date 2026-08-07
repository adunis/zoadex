import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HeatmapPoint } from '../../types/map';

vi.mock('react-leaflet', () => ({
  Marker: ({ position, icon }: Record<string, unknown>) => {
    const iconOptions = (icon as { options?: { className?: string; html?: string } })?.options;
    return (
      <div
        data-testid="marker"
        data-position={JSON.stringify(position)}
        data-class={iconOptions?.className}
        data-html={iconOptions?.html}
      />
    );
  },
  useMap: () => ({
    setView: vi.fn(),
    getZoom: () => 10,
  }),
  useMapEvents: vi.fn(),
}));

vi.mock('leaflet', () => ({
  default: {
    divIcon: (options: Record<string, unknown>) => ({ options }),
  },
}));

import { HeatmapLayer } from './HeatmapLayer';

describe('HeatmapLayer', () => {
  it('returns null when points are empty', () => {
    const { container } = render(<HeatmapLayer points={[]} visible={true} />);
    expect(container.innerHTML).toBe('');
  });

  it('returns null when not visible', () => {
    const points: HeatmapPoint[] = [
      { latitude: 44.5, longitude: 11.3, intensity: 5 },
    ];
    const { container } = render(<HeatmapLayer points={points} visible={false} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders markers for all points (no intensity filtering)', () => {
    const points: HeatmapPoint[] = [
      { latitude: 44.5, longitude: 11.3, intensity: 10, speciesId: 'sp-1' },
      { latitude: 44.6, longitude: 11.4, intensity: 3, speciesId: 'sp-2' },
      { latitude: 44.7, longitude: 11.5, intensity: 25, speciesId: 'sp-3' },
    ];

    render(<HeatmapLayer points={points} visible={true} />);

    const markers = screen.getAllByTestId('marker');
    expect(markers).toHaveLength(3);
  });

  it('applies rare class for intensity < 10', () => {
    const points: HeatmapPoint[] = [
      { latitude: 44.5, longitude: 11.3, intensity: 2, speciesId: 'sp-1' },
    ];
    const thresholds = { veryCommon: 25, common: 15, uncommon: 5 };

    render(<HeatmapLayer points={points} visible={true} rarityThresholds={thresholds} />);

    const marker = screen.getByTestId('marker');
    expect(marker.getAttribute('data-html')).toContain('map-species-icon--rare');
  });

  it('applies uncommon class for intensity 10-24', () => {
    const points: HeatmapPoint[] = [
      { latitude: 44.5, longitude: 11.3, intensity: 15, speciesId: 'sp-1' },
    ];
    const thresholds = { veryCommon: 25, common: 20, uncommon: 10 };

    render(<HeatmapLayer points={points} visible={true} rarityThresholds={thresholds} />);

    const marker = screen.getByTestId('marker');
    expect(marker.getAttribute('data-html')).toContain('map-species-icon--uncommon');
  });

  it('applies no rarity class for intensity >= 25 (common)', () => {
    const points: HeatmapPoint[] = [
      { latitude: 44.5, longitude: 11.3, intensity: 30, speciesId: 'sp-1' },
    ];
    const thresholds = { veryCommon: 50, common: 25, uncommon: 10 };

    render(<HeatmapLayer points={points} visible={true} rarityThresholds={thresholds} />);

    const marker = screen.getByTestId('marker');
    const html = marker.getAttribute('data-html') ?? '';
    expect(html).not.toContain('map-species-icon--rare');
    expect(html).not.toContain('map-species-icon--uncommon');
  });

  it('uses thumbnail image when available in speciesLookup', () => {
    const points: HeatmapPoint[] = [
      { latitude: 44.5, longitude: 11.3, intensity: 5, speciesId: 'sp-bird' },
    ];

    const speciesLookup = new Map([
      ['sp-bird', { commonName: 'Robin', scientificName: 'Erithacus rubecula', category: 'BIRDS', thumbnailUrl: 'https://example.com/robin.jpg' }],
    ]);

    render(<HeatmapLayer points={points} visible={true} speciesLookup={speciesLookup} />);

    const marker = screen.getByTestId('marker');
    expect(marker.getAttribute('data-html')).toContain('map-species-icon__img');
    expect(marker.getAttribute('data-html')).toContain('https://example.com/robin.jpg');
  });

  it('falls back to category emoji when no thumbnailUrl', () => {
    const points: HeatmapPoint[] = [
      { latitude: 44.5, longitude: 11.3, intensity: 5, speciesId: 'sp-bird' },
    ];

    const speciesLookup = new Map([
      ['sp-bird', { commonName: 'Robin', scientificName: 'Erithacus rubecula', category: 'BIRDS' }],
    ]);

    render(<HeatmapLayer points={points} visible={true} speciesLookup={speciesLookup} />);

    const marker = screen.getByTestId('marker');
    expect(marker.getAttribute('data-html')).toContain('🐦');
    expect(marker.getAttribute('data-html')).toContain('map-species-icon__emoji');
  });

  it('defaults to unknown emoji when speciesId not in lookup', () => {
    const points: HeatmapPoint[] = [
      { latitude: 44.5, longitude: 11.3, intensity: 10, speciesId: 'unknown' },
    ];

    render(<HeatmapLayer points={points} visible={true} />);

    const marker = screen.getByTestId('marker');
    expect(marker.getAttribute('data-html')).toContain('🔍');
  });
});
