import { describe, expect, it, vi } from 'vitest';
import { getPokemonList } from '../../application/usecases/getPokemonList';
import type { PokemonRepository } from '../../domain/ports/PokemonRepository';
import type { PokemonSummary } from '../../domain/entities/Pokemon';

const pikachu: PokemonSummary = {
  id: 25,
  name: 'pikachu',
  displayName: 'Pikachu',
  types: ['electric'],
  generation: 'generation-i',
  sprite: '',
};

const pichu: PokemonSummary = {
  id: 172,
  name: 'pichu',
  displayName: 'Pichu',
  types: ['electric'],
  generation: 'generation-ii',
  sprite: '',
};

function mockRepo(overrides: Partial<PokemonRepository> = {}): PokemonRepository {
  return {
    findAll: vi.fn().mockResolvedValue([pikachu]),
    findById: vi.fn().mockResolvedValue(null),
    findEvolutionChain: vi.fn().mockResolvedValue({
      id: 10,
      chain: {
        id: 172,
        name: 'pichu',
        displayName: 'Pichu',
        sprite: '',
        evolvesTo: [],
      },
    }),
    searchByNameWithEvolutions: vi.fn().mockResolvedValue([pikachu, pichu]),
    ...overrides,
  };
}

describe('getPokemonList', () => {
  it('calls findAll when no search term is provided', async () => {
    const repo = mockRepo();
    const result = await getPokemonList(repo, {
      filters: { type: 'electric' },
    });

    expect(repo.findAll).toHaveBeenCalledWith({ type: 'electric' });
    expect(repo.searchByNameWithEvolutions).not.toHaveBeenCalled();
    expect(result.pokemon).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('calls searchByNameWithEvolutions when search term is provided', async () => {
    const repo = mockRepo();
    const result = await getPokemonList(repo, {
      search: 'pikachu',
      filters: { generation: 'generation-i' },
    });

    expect(repo.searchByNameWithEvolutions).toHaveBeenCalledWith('pikachu', {
      generation: 'generation-i',
    });
    expect(repo.findAll).not.toHaveBeenCalled();
    expect(result.pokemon).toHaveLength(2);
    expect(result.total).toBe(2);
  });

  it('returns correct total count', async () => {
    const repo = mockRepo({
      findAll: vi.fn().mockResolvedValue([pikachu, pichu]),
    });
    const result = await getPokemonList(repo);
    expect(result.total).toBe(2);
  });

  it('works with no input (returns all)', async () => {
    const repo = mockRepo();
    await getPokemonList(repo);
    expect(repo.findAll).toHaveBeenCalledWith(undefined);
  });
});
