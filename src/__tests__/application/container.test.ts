import { afterEach, describe, expect, it, vi } from 'vitest';
import { getRepository, resetRepository, setRepository } from '../../application/container';
import type { PokemonRepository } from '../../domain/ports/PokemonRepository';

afterEach(() => resetRepository());

describe('container', () => {
  it('returns a PokeApiRepository by default', () => {
    const repo = getRepository();
    expect(repo).toBeDefined();
    expect(typeof repo.findAll).toBe('function');
    expect(typeof repo.findById).toBe('function');
  });

  it('returns the same singleton on multiple calls', () => {
    const a = getRepository();
    const b = getRepository();
    expect(a).toBe(b);
  });

  it('allows injecting a mock repository', () => {
    const mock: PokemonRepository = {
      findAll: vi.fn(),
      findById: vi.fn(),
      findEvolutionChain: vi.fn(),
      searchByNameWithEvolutions: vi.fn(),
      findSpeciesData: vi.fn(),
      findMoveLearnset: vi.fn().mockResolvedValue([]),
      findAbilities: vi.fn().mockResolvedValue([]),
    };
    setRepository(mock);
    expect(getRepository()).toBe(mock);
  });

  it('resets to a new instance after resetRepository', () => {
    const first = getRepository();
    resetRepository();
    const second = getRepository();
    expect(second).not.toBe(first);
  });
});
