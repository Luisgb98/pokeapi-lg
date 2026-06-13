import { describe, expect, it, vi } from 'vitest';
import { getSpeciesData } from '../../application/usecases/getSpeciesData';
import type { PokemonRepository } from '../../domain/ports/PokemonRepository';
import type { PokemonSpecies } from '../../domain/entities/PokemonSpecies';

const mockSpecies: PokemonSpecies = {
  genus: 'Mouse Pokémon',
  flavorText: 'When several of these Pokémon gather, their electricity can cause lightning storms.',
  eggGroups: ['field', 'fairy'],
  genderRate: 4,
  captureRate: 190,
  baseHappiness: 70,
  varieties: [],
};

function makeRepo(): PokemonRepository {
  return {
    findAll: vi.fn(),
    findById: vi.fn(),
    findEvolutionChain: vi.fn(),
    searchByNameWithEvolutions: vi.fn(),
    findSpeciesData: vi.fn().mockResolvedValue(mockSpecies),
    findMoveLearnset: vi.fn().mockResolvedValue([]),
    findAbilities: vi.fn().mockResolvedValue([]),
  };
}

describe('getSpeciesData', () => {
  it('calls findSpeciesData with the given id and locale', async () => {
    const repo = makeRepo();
    await getSpeciesData(repo, 25, 'en');
    expect(repo.findSpeciesData).toHaveBeenCalledWith(25, 'en');
  });

  it('returns the species data from the repository', async () => {
    const result = await getSpeciesData(makeRepo(), 25, 'es');
    expect(result).toEqual(mockSpecies);
  });
});
