import { afterEach, describe, expect, it, vi } from 'vitest';
import { resetRepository, setRepository } from '../../application/container';
import { fetchPokemonById, fetchPokemonPage } from '../../application/actions/pokemon';
import type { PokemonRepository } from '../../domain/ports/PokemonRepository';
import type { Pokemon } from '../../domain/entities/Pokemon';
import type { EvolutionChain } from '../../domain/entities/EvolutionChain';

afterEach(() => resetRepository());

const pikachu: Pokemon = {
  id: 25,
  name: 'pikachu',
  displayName: 'Pikachu',
  types: ['electric'],
  generation: 'generation-i',
  sprite: '',
  artwork: '',
  shinyArtwork: '',
  stats: { hp: 35, attack: 55, defense: 40, specialAttack: 50, specialDefense: 50, speed: 90 },
  evolutionChainId: 10,
};

const chain: EvolutionChain = {
  id: 10,
  chain: { id: 172, name: 'pichu', displayName: 'Pichu', sprite: '', evolvesTo: [] },
};

function mockRepo(overrides: Partial<PokemonRepository> = {}): PokemonRepository {
  return {
    findAll: vi.fn().mockResolvedValue({ items: [pikachu], total: 1, hasMore: false }),
    findById: vi.fn().mockResolvedValue(pikachu),
    findEvolutionChain: vi.fn().mockResolvedValue(chain),
    searchByNameWithEvolutions: vi.fn().mockResolvedValue([pikachu]),
    findSpeciesData: vi.fn(),
    findMoveLearnset: vi.fn().mockResolvedValue([]),
    ...overrides,
  };
}

describe('fetchPokemonById', () => {
  it('returns the pokemon for the given id', async () => {
    setRepository(mockRepo());
    const result = await fetchPokemonById(25);
    expect(result.id).toBe(25);
    expect(result.name).toBe('pikachu');
  });
});

describe('fetchPokemonPage', () => {
  it('returns paginated results with no filters', async () => {
    setRepository(mockRepo());
    const result = await fetchPokemonPage({}, 0);
    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('passes type and generation filters to the use case', async () => {
    const repo = mockRepo();
    setRepository(repo);
    await fetchPokemonPage({ types: ['electric'], generations: ['generation-i'] }, 0);
    expect(repo.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ types: ['electric'], generations: ['generation-i'] }),
      expect.anything(),
    );
  });

  it('uses searchByNameWithEvolutions when a search term is provided', async () => {
    const repo = mockRepo();
    setRepository(repo);
    await fetchPokemonPage({ search: 'pika' }, 0);
    expect(repo.searchByNameWithEvolutions).toHaveBeenCalledWith('pika', expect.anything());
  });
});
