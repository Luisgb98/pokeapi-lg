import { describe, expect, it } from 'vitest';
import {
  formatEggGroupName,
  formatVarietyDisplayName,
  getFemalePercent,
} from '../../domain/entities/PokemonSpecies';

describe('getFemalePercent', () => {
  it('returns null for genderless (-1)', () => {
    expect(getFemalePercent(-1)).toBeNull();
  });

  it('returns 0 for always male (0)', () => {
    expect(getFemalePercent(0)).toBe(0);
  });

  it('returns 12.5 for genderRate 1', () => {
    expect(getFemalePercent(1)).toBe(12.5);
  });

  it('returns 50 for genderRate 4', () => {
    expect(getFemalePercent(4)).toBe(50);
  });

  it('returns 100 for always female (8)', () => {
    expect(getFemalePercent(8)).toBe(100);
  });
});

describe('formatVarietyDisplayName', () => {
  it('returns "Default" when variety matches base name', () => {
    expect(formatVarietyDisplayName('pikachu', 'pikachu')).toBe('Default');
  });

  it('strips base name prefix and title-cases the suffix', () => {
    expect(formatVarietyDisplayName('charizard', 'charizard-mega-x')).toBe('Mega X');
  });

  it('handles single-word suffix', () => {
    expect(formatVarietyDisplayName('giratina', 'giratina-origin')).toBe('Origin');
  });

  it('handles regional form names', () => {
    expect(formatVarietyDisplayName('raichu', 'raichu-alola')).toBe('Alola');
  });

  it('uses full name when variety does not start with base prefix', () => {
    expect(formatVarietyDisplayName('mewtwo', 'mewtwo-mega')).toBe('Mega');
  });
});

describe('formatEggGroupName', () => {
  it('formats known single-word groups', () => {
    expect(formatEggGroupName('field')).toBe('Field');
    expect(formatEggGroupName('monster')).toBe('Monster');
    expect(formatEggGroupName('undiscovered')).toBe('Undiscovered');
  });

  it('formats numbered water groups', () => {
    expect(formatEggGroupName('water1')).toBe('Water 1');
    expect(formatEggGroupName('water2')).toBe('Water 2');
    expect(formatEggGroupName('water3')).toBe('Water 3');
  });

  it('formats hyphenated groups', () => {
    expect(formatEggGroupName('human-like')).toBe('Human-Like');
    expect(formatEggGroupName('water-body')).toBe('Water Body');
  });

  it('falls back to capitalised hyphen-split for unknown names', () => {
    expect(formatEggGroupName('some-unknown-group')).toBe('Some Unknown Group');
  });
});
