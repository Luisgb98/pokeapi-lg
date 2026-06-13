import { afterEach, describe, expect, it, vi } from 'vitest';
import { resetRepository, setRepository } from '../../application/container';
import { fetchNextChallenge } from '../../application/actions/game';
import { getDailySeed } from '../../application/usecases/getGameChallenge';
import type { PokemonRepository } from '../../domain/ports/PokemonRepository';
import type { PokemonSummary } from '../../domain/entities/Pokemon';

afterEach(() => resetRepository());

const makeSummary = (id: number): PokemonSummary => ({
  id,
  name: `pokemon-${id}`,
  displayName: `Pokemon ${id}`,
  types: ['normal'],
  generation: 'generation-i',
  sprite: '',
});

const MOCK_TOTAL = 20;
const MOCK_ITEMS = Array.from({ length: MOCK_TOTAL }, (_, i) => makeSummary(i + 1));

function makeRepo(overrides: Partial<PokemonRepository> = {}): PokemonRepository {
  return {
    findAll: vi.fn().mockImplementation(async (_filters, pagination) => {
      if (pagination?.limit === 0) {
        return { items: [], total: MOCK_TOTAL, hasMore: false };
      }
      const idx = (pagination?.offset ?? 0) % MOCK_TOTAL;
      return { items: [MOCK_ITEMS[idx]], total: MOCK_TOTAL, hasMore: false };
    }),
    findById: vi.fn().mockResolvedValue(null),
    findSpeciesData: vi.fn().mockResolvedValue(null),
    findEvolutionChain: vi.fn().mockResolvedValue(null),
    findMoveLearnset: vi.fn().mockResolvedValue([]),
    searchByNameWithEvolutions: vi.fn().mockResolvedValue([]),
    findAbilities: vi.fn().mockResolvedValue([]),
    ...overrides,
  };
}

describe('fetchNextChallenge', () => {
  it('exercises the repository when called with offset 0', async () => {
    const repo = makeRepo();
    setRepository(repo);
    const result = await fetchNextChallenge(0);
    expect(repo.findAll).toHaveBeenCalled();
    expect(result.choices).toHaveLength(4);
  });

  it('produces challenges with different seeds for different round offsets', async () => {
    setRepository(makeRepo());
    const r0 = await fetchNextChallenge(0);
    const r1 = await fetchNextChallenge(1);
    // Each roundOffset shifts the seed by one day, producing a different challenge
    expect(r0.seed).toBe(getDailySeed() + 0);
    expect(r1.seed).toBe(getDailySeed() + 1);
    expect(r0.seed).not.toBe(r1.seed);
  });
});
