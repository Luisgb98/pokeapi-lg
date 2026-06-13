import { describe, expect, it, vi } from 'vitest';
import { getAbilities } from '../../application/usecases/getAbilities';
import type { PokemonRepository } from '../../domain/ports/PokemonRepository';
import type { Ability } from '../../domain/entities/Ability';

const mockAbility: Ability = {
  name: 'static',
  displayName: 'Static',
  effect: 'May cause paralysis if the foe touches the Pokémon.',
  isHidden: false,
};

function makeRepo(): PokemonRepository {
  return {
    findAll: vi.fn(),
    findById: vi.fn(),
    findEvolutionChain: vi.fn(),
    searchByNameWithEvolutions: vi.fn(),
    findSpeciesData: vi.fn(),
    findMoveLearnset: vi.fn().mockResolvedValue([]),
    findAbilities: vi.fn().mockResolvedValue([mockAbility]),
  };
}

describe('getAbilities', () => {
  it('delegates to repository.findAbilities with refs and locale', async () => {
    const repo = makeRepo();
    const refs = [{ name: 'static', isHidden: false }];
    await getAbilities(repo, refs, 'en');
    expect(repo.findAbilities).toHaveBeenCalledWith(refs, 'en');
  });

  it('returns the abilities from the repository', async () => {
    const repo = makeRepo();
    const result = await getAbilities(repo, [{ name: 'static', isHidden: false }], 'en');
    expect(result).toEqual([mockAbility]);
  });

  it('returns empty array without calling repository when refs is empty', async () => {
    const repo = makeRepo();
    const result = await getAbilities(repo, [], 'en');
    expect(result).toEqual([]);
    expect(repo.findAbilities).not.toHaveBeenCalled();
  });
});
