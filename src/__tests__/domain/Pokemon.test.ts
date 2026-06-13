import { describe, expect, it } from 'vitest';
import {
  extractIdFromUrl,
  formatHeight,
  formatPokemonName,
  formatWeight,
  getGenerationFromId,
  getOfficialArtworkUrl,
  getSpriteUrl,
} from '../../domain/entities/Pokemon';

describe('getGenerationFromId', () => {
  it.each([
    [1, 'generation-i'],
    [151, 'generation-i'],
    [152, 'generation-ii'],
    [251, 'generation-ii'],
    [252, 'generation-iii'],
    [386, 'generation-iii'],
    [387, 'generation-iv'],
    [493, 'generation-iv'],
    [494, 'generation-v'],
    [649, 'generation-v'],
    [650, 'generation-vi'],
    [721, 'generation-vi'],
    [722, 'generation-vii'],
    [809, 'generation-vii'],
    [810, 'generation-viii'],
    [905, 'generation-viii'],
    [906, 'generation-ix'],
    [1025, 'generation-ix'],
  ] as const)('id %d → %s', (id, expected) => {
    expect(getGenerationFromId(id)).toBe(expected);
  });
});

describe('formatPokemonName', () => {
  it('capitalises single-word names', () => {
    expect(formatPokemonName('pikachu')).toBe('Pikachu');
  });

  it('capitalises each segment of hyphenated names', () => {
    expect(formatPokemonName('mr-mime')).toBe('Mr Mime');
  });

  it('handles three-part names', () => {
    expect(formatPokemonName('tapu-koko')).toBe('Tapu Koko');
  });
});

describe('extractIdFromUrl', () => {
  it('extracts id from standard PokeAPI URL', () => {
    expect(extractIdFromUrl('https://pokeapi.co/api/v2/pokemon/25/')).toBe(25);
  });

  it('works without trailing slash', () => {
    expect(extractIdFromUrl('https://pokeapi.co/api/v2/evolution-chain/10')).toBe(10);
  });

  it('throws on malformed URL', () => {
    expect(() => extractIdFromUrl('not-a-url')).toThrow();
  });
});

describe('formatHeight', () => {
  it('converts decimetres to metres with one decimal', () => {
    expect(formatHeight(4)).toBe('0.4 m');
    expect(formatHeight(17)).toBe('1.7 m');
  });
});

describe('formatWeight', () => {
  it('converts hectograms to kilograms with one decimal', () => {
    expect(formatWeight(60)).toBe('6.0 kg');
    expect(formatWeight(9999)).toBe('999.9 kg');
  });
});

describe('sprite/artwork helpers', () => {
  it('returns correct sprite URL', () => {
    expect(getSpriteUrl(25)).toBe(
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
    );
  });

  it('returns correct artwork URL', () => {
    expect(getOfficialArtworkUrl(25)).toBe(
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
    );
  });
});
