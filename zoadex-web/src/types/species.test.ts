import { describe, it, expect } from 'vitest';
import { getMacroCategory, SpeciesCategory } from './species';

describe('getMacroCategory', () => {
  it('maps BIRDS to ANIMALS', () => {
    expect(getMacroCategory(SpeciesCategory.BIRDS)).toBe('ANIMALS');
  });

  it('maps MAMMALS to ANIMALS', () => {
    expect(getMacroCategory(SpeciesCategory.MAMMALS)).toBe('ANIMALS');
  });

  it('maps REPTILES to ANIMALS', () => {
    expect(getMacroCategory(SpeciesCategory.REPTILES)).toBe('ANIMALS');
  });

  it('maps AMPHIBIANS to ANIMALS', () => {
    expect(getMacroCategory(SpeciesCategory.AMPHIBIANS)).toBe('ANIMALS');
  });

  it('maps FISH to ANIMALS', () => {
    expect(getMacroCategory(SpeciesCategory.FISH)).toBe('ANIMALS');
  });

  it('maps INSECTS to ANIMALS', () => {
    expect(getMacroCategory(SpeciesCategory.INSECTS)).toBe('ANIMALS');
  });

  it('maps TREES to PLANTS', () => {
    expect(getMacroCategory(SpeciesCategory.TREES)).toBe('PLANTS');
  });

  it('maps PLANTS to PLANTS', () => {
    expect(getMacroCategory(SpeciesCategory.PLANTS)).toBe('PLANTS');
  });

  it('maps MUSHROOMS to MUSHROOMS', () => {
    expect(getMacroCategory(SpeciesCategory.MUSHROOMS)).toBe('MUSHROOMS');
  });
});

describe('SpeciesCategory enum', () => {
  it('has all expected enum values', () => {
    expect(SpeciesCategory.BIRDS).toBe('BIRDS');
    expect(SpeciesCategory.MAMMALS).toBe('MAMMALS');
    expect(SpeciesCategory.INSECTS).toBe('INSECTS');
    expect(SpeciesCategory.REPTILES).toBe('REPTILES');
    expect(SpeciesCategory.AMPHIBIANS).toBe('AMPHIBIANS');
    expect(SpeciesCategory.FISH).toBe('FISH');
    expect(SpeciesCategory.MUSHROOMS).toBe('MUSHROOMS');
    expect(SpeciesCategory.TREES).toBe('TREES');
    expect(SpeciesCategory.PLANTS).toBe('PLANTS');
  });

  it('does NOT have INVERTEBRATES value (regression test)', () => {
    const values = Object.values(SpeciesCategory);
    expect(values).not.toContain('INVERTEBRATES');
  });

  it('has exactly 9 enum values', () => {
    const values = Object.values(SpeciesCategory);
    expect(values).toHaveLength(9);
  });
});
