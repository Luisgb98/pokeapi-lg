import { describe, expect, it, vi } from 'vitest';
import { getMoveLearnset } from '../../application/usecases/getMoveLearnset';
import type { PokemonRepository } from '../../domain/ports/PokemonRepository';
import type { LearnedMove } from '../../domain/entities/Move';

const mockLearnset: LearnedMove[] = [
  {
    move: {
      id: 84,
      name: 'thundershock',
      displayName: 'ThunderShock',
      type: 'electric',
      damageClass: 'special',
      power: 40,
      accuracy: 100,
      pp: 30,
    },
    learnMethod: 'level-up',
    levelLearnedAt: 1,
  },
];

describe('getMoveLearnset', () => {
  it('delegates to repository.findMoveLearnset and returns the result', async () => {
    const repo = {
      findMoveLearnset: vi.fn().mockResolvedValue(mockLearnset),
    } as unknown as PokemonRepository;

    const result = await getMoveLearnset(repo, 25, 'en');

    expect(repo.findMoveLearnset).toHaveBeenCalledWith(25, 'en');
    expect(result).toBe(mockLearnset);
  });

  it('forwards the locale to the repository', async () => {
    const repo = {
      findMoveLearnset: vi.fn().mockResolvedValue(mockLearnset),
    } as unknown as PokemonRepository;

    await getMoveLearnset(repo, 25, 'de');

    expect(repo.findMoveLearnset).toHaveBeenCalledWith(25, 'de');
  });

  it('returns empty array when repository returns no moves', async () => {
    const repo = {
      findMoveLearnset: vi.fn().mockResolvedValue([]),
    } as unknown as PokemonRepository;

    const result = await getMoveLearnset(repo, 999, 'en');

    expect(result).toEqual([]);
  });
});
