import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { HeatmapPoint } from '../../types/map';

// Capture moveend/zoomend handlers and the center mock for control in tests
let capturedMoveEnd: (() => void) | undefined;
let capturedZoomEnd: (() => void) | undefined;
const mockGetCenter = vi.fn(() => ({ lat: 44.5, lng: 11.3 }));

vi.mock('react-leaflet', () => ({
  useMap: () => ({ getCenter: mockGetCenter }),
  useMapEvents: (handlers: { moveend?: () => void; zoomend?: () => void }) => {
    capturedMoveEnd = handlers.moveend;
    capturedZoomEnd = handlers.zoomend;
    return null;
  },
}));

import { MapHoverHandler } from './MapHoverHandler';

describe('MapHoverHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedMoveEnd = undefined;
    capturedZoomEnd = undefined;
    mockGetCenter.mockReturnValue({ lat: 44.5, lng: 11.3 });
  });

  it('calls onSpeciesAtCursor with empty array when disabled', () => {
    const onSpeciesAtCursor = vi.fn();
    const points: HeatmapPoint[] = [
      { latitude: 44.5, longitude: 11.3, intensity: 5, speciesId: 'sp-1' },
    ];

    render(
      <MapHoverHandler
        points={points}
        onSpeciesAtCursor={onSpeciesAtCursor}
        enabled={false}
      />
    );

    expect(onSpeciesAtCursor).toHaveBeenCalledWith([]);
  });

  it('calls onSpeciesAtCursor with empty array when points are empty', () => {
    const onSpeciesAtCursor = vi.fn();

    render(
      <MapHoverHandler
        points={[]}
        onSpeciesAtCursor={onSpeciesAtCursor}
        enabled={true}
      />
    );

    expect(onSpeciesAtCursor).toHaveBeenCalledWith([]);
  });

  it('detects species within default radius when no speciesLookup provided', () => {
    const onSpeciesAtCursor = vi.fn();
    // Default radius = 0.02; point at exactly 0.01 degrees away — within range
    const points: HeatmapPoint[] = [
      { latitude: 44.51, longitude: 11.3, intensity: 5, speciesId: 'sp-near' },
      { latitude: 44.6, longitude: 11.3, intensity: 5, speciesId: 'sp-far' },
    ];

    render(
      <MapHoverHandler
        points={points}
        onSpeciesAtCursor={onSpeciesAtCursor}
        enabled={true}
      />
    );

    expect(onSpeciesAtCursor).toHaveBeenCalledWith(['sp-near']);
  });

  it('uses BIRDS radius (0.05) — detects at 0.04 degrees', () => {
    const onSpeciesAtCursor = vi.fn();
    // Bird point 0.04 degrees away — within bird radius 0.05
    const points: HeatmapPoint[] = [
      { latitude: 44.54, longitude: 11.3, intensity: 5, speciesId: 'sp-bird' },
    ];
    const speciesLookup = new Map([
      ['sp-bird', { commonName: 'Sparrow', scientificName: 'Passer domesticus', category: 'BIRDS', occurrenceCount: 10 }],
    ]);

    render(
      <MapHoverHandler
        points={points}
        onSpeciesAtCursor={onSpeciesAtCursor}
        enabled={true}
        speciesLookup={speciesLookup}
      />
    );

    expect(onSpeciesAtCursor).toHaveBeenCalledWith(['sp-bird']);
  });

  it('uses PLANTS radius (0.005) — does NOT detect at 0.01 degrees', () => {
    const onSpeciesAtCursor = vi.fn();
    // Plant point 0.01 degrees away — outside plant radius 0.005
    const points: HeatmapPoint[] = [
      { latitude: 44.51, longitude: 11.3, intensity: 5, speciesId: 'sp-plant' },
    ];
    const speciesLookup = new Map([
      ['sp-plant', { commonName: 'Oak', scientificName: 'Quercus robur', category: 'PLANTS', occurrenceCount: 30 }],
    ]);

    render(
      <MapHoverHandler
        points={points}
        onSpeciesAtCursor={onSpeciesAtCursor}
        enabled={true}
        speciesLookup={speciesLookup}
      />
    );

    expect(onSpeciesAtCursor).toHaveBeenCalledWith([]);
  });

  it('uses PLANTS radius (0.005) — detects at 0.003 degrees', () => {
    const onSpeciesAtCursor = vi.fn();
    // Plant point 0.003 degrees away — within plant radius 0.005
    const points: HeatmapPoint[] = [
      { latitude: 44.503, longitude: 11.3, intensity: 5, speciesId: 'sp-plant' },
    ];
    const speciesLookup = new Map([
      ['sp-plant', { commonName: 'Oak', scientificName: 'Quercus robur', category: 'PLANTS', occurrenceCount: 30 }],
    ]);

    render(
      <MapHoverHandler
        points={points}
        onSpeciesAtCursor={onSpeciesAtCursor}
        enabled={true}
        speciesLookup={speciesLookup}
      />
    );

    expect(onSpeciesAtCursor).toHaveBeenCalledWith(['sp-plant']);
  });

  it('applies different radii to mixed-category points simultaneously', () => {
    const onSpeciesAtCursor = vi.fn();
    // Bird at 0.04 away (within 0.05 bird radius) — detected
    // Plant at 0.01 away (outside 0.005 plant radius) — NOT detected
    // Amphibian at 0.008 away (within 0.01 amphibian radius) — detected
    const points: HeatmapPoint[] = [
      { latitude: 44.54, longitude: 11.3, intensity: 5, speciesId: 'sp-bird' },
      { latitude: 44.51, longitude: 11.3, intensity: 5, speciesId: 'sp-plant' },
      { latitude: 44.508, longitude: 11.3, intensity: 5, speciesId: 'sp-amphibian' },
    ];
    const speciesLookup = new Map([
      ['sp-bird', { commonName: 'Sparrow', scientificName: 'Passer domesticus', category: 'BIRDS', occurrenceCount: 10 }],
      ['sp-plant', { commonName: 'Oak', scientificName: 'Quercus robur', category: 'PLANTS', occurrenceCount: 30 }],
      ['sp-amphibian', { commonName: 'Tree Frog', scientificName: 'Hyla arborea', category: 'AMPHIBIANS', occurrenceCount: 5 }],
    ]);

    render(
      <MapHoverHandler
        points={points}
        onSpeciesAtCursor={onSpeciesAtCursor}
        enabled={true}
        speciesLookup={speciesLookup}
      />
    );

    const detected = onSpeciesAtCursor.mock.calls.at(-1)?.[0] as string[];
    expect(detected).toContain('sp-bird');
    expect(detected).toContain('sp-amphibian');
    expect(detected).not.toContain('sp-plant');
  });

  it('deduplicates species with multiple nearby points', () => {
    const onSpeciesAtCursor = vi.fn();
    const points: HeatmapPoint[] = [
      { latitude: 44.501, longitude: 11.3, intensity: 5, speciesId: 'sp-bird' },
      { latitude: 44.502, longitude: 11.3, intensity: 3, speciesId: 'sp-bird' },
    ];
    const speciesLookup = new Map([
      ['sp-bird', { commonName: 'Sparrow', scientificName: 'Passer domesticus', category: 'BIRDS', occurrenceCount: 10 }],
    ]);

    render(
      <MapHoverHandler
        points={points}
        onSpeciesAtCursor={onSpeciesAtCursor}
        enabled={true}
        speciesLookup={speciesLookup}
      />
    );

    const detected = onSpeciesAtCursor.mock.calls.at(-1)?.[0] as string[];
    expect(detected).toEqual(['sp-bird']);
  });

  it('updates species when map moves (moveend)', () => {
    const onSpeciesAtCursor = vi.fn();
    const points: HeatmapPoint[] = [
      { latitude: 44.51, longitude: 11.3, intensity: 5, speciesId: 'sp-near' },
    ];

    render(
      <MapHoverHandler
        points={points}
        onSpeciesAtCursor={onSpeciesAtCursor}
        enabled={true}
      />
    );

    // Move map so center is far from the point
    mockGetCenter.mockReturnValue({ lat: 45.0, lng: 11.3 });
    capturedMoveEnd?.();

    const lastCall = onSpeciesAtCursor.mock.calls.at(-1)?.[0] as string[];
    expect(lastCall).toEqual([]);
  });

  it('updates species when map zooms (zoomend)', () => {
    const onSpeciesAtCursor = vi.fn();
    const points: HeatmapPoint[] = [
      { latitude: 44.51, longitude: 11.3, intensity: 5, speciesId: 'sp-near' },
    ];

    render(
      <MapHoverHandler
        points={points}
        onSpeciesAtCursor={onSpeciesAtCursor}
        enabled={true}
      />
    );

    mockGetCenter.mockReturnValue({ lat: 45.0, lng: 11.3 });
    capturedZoomEnd?.();

    const lastCall = onSpeciesAtCursor.mock.calls.at(-1)?.[0] as string[];
    expect(lastCall).toEqual([]);
  });

  it('falls back to DEFAULT_DETECTION_RADIUS for unknown category', () => {
    const onSpeciesAtCursor = vi.fn();
    // Default radius = 0.02; point 0.01 degrees away — within default range
    const points: HeatmapPoint[] = [
      { latitude: 44.51, longitude: 11.3, intensity: 5, speciesId: 'sp-unknown' },
    ];
    const speciesLookup = new Map([
      ['sp-unknown', { commonName: 'Mystery', scientificName: 'Alienus mysticus', category: 'ALIEN_LIFEFORM', occurrenceCount: 1 }],
    ]);

    render(
      <MapHoverHandler
        points={points}
        onSpeciesAtCursor={onSpeciesAtCursor}
        enabled={true}
        speciesLookup={speciesLookup}
      />
    );

    expect(onSpeciesAtCursor).toHaveBeenCalledWith(['sp-unknown']);
  });
});
