import { describe, expect, it, vi } from 'vitest';
import { getPokemonById, PokemonNotFoundError } from '../../application/usecases/getPokemonById';
import type { PokemonRepository } from '../../domain/ports/PokemonRepository';
import type { Pokemon } from '../../domain/entities/Pokemon';
import type { EvolutionChain } from '../../domain/entities/EvolutionChain';

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
  chain: {
    id: 172,
    name: 'pichu',
    displayName: 'Pichu',
    sprite: '',
    evolvesTo: [
      {
        id: 25,
        name: 'pikachu',
        displayName: 'Pikachu',
        sprite: '',
        evolvesTo: [],
      },
    ],
  },
};

function mockRepo(overrides: Partial<PokemonRepository> = {}): PokemonRepository {
  return {
    findAll: vi.fn(),
    findById: vi.fn().mockResolvedValue(pikachu),
    findEvolutionChain: vi.fn().mockResolvedValue(chain),
    searchByNameWithEvolutions: vi.fn(),
    findSpeciesData: vi.fn(),
    findMoveLearnset: vi.fn().mockResolvedValue([]),
    ...overrides,
  };
}

describe('getPokemonById', () => {
  it('returns pokemon and its evolution chain', async () => {
    const repo = mockRepo();
    const result = await getPokemonById(repo, 25);

    expect(result.pokemon).toEqual(pikachu);
    expect(result.evolutionChain).toEqual(chain);
  });

  it('fetches evolution chain using the pokemon evolutionChainId', async () => {
    const repo = mockRepo();
    await getPokemonById(repo, 25);

    expect(repo.findEvolutionChain).toHaveBeenCalledWith(10);
  });

  it('throws PokemonNotFoundError when pokemon does not exist', async () => {
    const repo = mockRepo({ findById: vi.fn().mockResolvedValue(null) });

    await expect(getPokemonById(repo, 9999)).rejects.toThrow(PokemonNotFoundError);
    await expect(getPokemonById(repo, 9999)).rejects.toThrow('9999');
  });

  it('does not fetch evolution chain when pokemon is not found', async () => {
    const repo = mockRepo({ findById: vi.fn().mockResolvedValue(null) });

    try {
      await getPokemonById(repo, 9999);
    } catch {
      // expected
    }

    expect(repo.findEvolutionChain).not.toHaveBeenCalled();
  });
});
