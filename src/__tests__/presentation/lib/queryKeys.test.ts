import { describe, expect, it } from 'vitest';
import {
  normalizePokemonParams,
  pokemonListQueryKey,
  type PokemonListParams,
} from '../../../presentation/lib/queryKeys';

describe('normalizePokemonParams', () => {
  it('returns empty object for empty input', () => {
    expect(normalizePokemonParams({})).toEqual({});
  });

  it('strips empty arrays for types and generations', () => {
    expect(normalizePokemonParams({ types: [], generations: [] })).toEqual({});
  });

  it('sorts types alphabetically', () => {
    expect(normalizePokemonParams({ types: ['water', 'fire'] })).toEqual({
      types: ['fire', 'water'],
    });
  });

  it('sorts generations alphabetically', () => {
    expect(
      normalizePokemonParams({ generations: ['generation-ii', 'generation-i'] }),
    ).toEqual({ generations: ['generation-i', 'generation-ii'] });
  });

  it('omits typeMatchMode when only one type is present', () => {
    expect(normalizePokemonParams({ types: ['fire'], typeMatchMode: 'all' })).toEqual({
      types: ['fire'],
    });
  });

  it('preserves typeMatchMode "all" when two or more types are present', () => {
    expect(
      normalizePokemonParams({ types: ['fire', 'water'], typeMatchMode: 'all' }),
    ).toEqual({ types: ['fire', 'water'], typeMatchMode: 'all' });
  });

  it('omits typeMatchMode "any" regardless of type count', () => {
    expect(normalizePokemonParams({ types: ['fire'], typeMatchMode: 'any' })).toEqual({
      types: ['fire'],
    });
  });

  it('trims whitespace from search', () => {
    expect(normalizePokemonParams({ search: '  pikachu  ' })).toEqual({
      search: 'pikachu',
    });
  });

  it('strips whitespace-only search', () => {
    expect(normalizePokemonParams({ search: '   ' })).toEqual({});
  });

  it('is idempotent', () => {
    const input: PokemonListParams = { types: ['water', 'fire'], typeMatchMode: 'all', search: ' pika ' };
    const once = normalizePokemonParams(input);
    const twice = normalizePokemonParams(once);
    expect(twice).toEqual(once);
  });
});

describe('pokemonListQueryKey', () => {
  it('produces the same key regardless of types order', () => {
    const key1 = JSON.stringify(pokemonListQueryKey({ types: ['water', 'fire'] }));
    const key2 = JSON.stringify(pokemonListQueryKey({ types: ['fire', 'water'] }));
    expect(key1).toBe(key2);
  });
});
