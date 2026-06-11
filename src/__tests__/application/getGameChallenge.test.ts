import { describe, expect, it, vi } from 'vitest';
import {
  getDailySeed,
  getGameChallenge,
} from '../../application/usecases/getGameChallenge';
import type { PokemonRepository } from '../../domain/ports/PokemonRepository';
import type { PokemonSummary } from '../../domain/entities/Pokemon';

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
    ...overrides,
  };
}

describe('getDailySeed', () => {
  it('returns the same integer when called twice in the same test', () => {
    expect(getDailySeed()).toBe(getDailySeed());
  });

  it('returns a positive integer', () => {
    const seed = getDailySeed();
    expect(seed).toBeGreaterThan(0);
    expect(Number.isInteger(seed)).toBe(true);
  });

  it('is UTC-based: returns days-since-epoch for 2026-01-01T00:00:00Z', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    try {
      const expected = Math.floor(Date.UTC(2026, 0, 1) / 86_400_000);
      expect(getDailySeed()).toBe(expected);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('getGameChallenge', () => {
  it('returns 4 choices', async () => {
    const result = await getGameChallenge(makeRepo(), 42);
    expect(result.choices).toHaveLength(4);
  });

  it('correct is one of the choices', async () => {
    const result = await getGameChallenge(makeRepo(), 42);
    expect(result.choices.some((c) => c.id === result.correct.id)).toBe(true);
  });

  it('result.seed equals the seed passed in', async () => {
    const result = await getGameChallenge(makeRepo(), 999);
    expect(result.seed).toBe(999);
  });

  it('is deterministic — same seed always returns same correct.id', async () => {
    const seed = 42;
    const r1 = await getGameChallenge(makeRepo(), seed);
    const r2 = await getGameChallenge(makeRepo(), seed);
    expect(r1.correct.id).toBe(r2.correct.id);
    expect(r1.choices.map((c) => c.id)).toEqual(r2.choices.map((c) => c.id));
  });

  it('different seeds produce different challenges', async () => {
    const r1 = await getGameChallenge(makeRepo(), 1);
    const r2 = await getGameChallenge(makeRepo(), 999_999);
    // With 20 items and a well-distributed RNG, far-apart seeds pick different choices
    const ids1 = r1.choices.map((c) => c.id).join(',');
    const ids2 = r2.choices.map((c) => c.id).join(',');
    expect(ids1).not.toBe(ids2);
  });

  it('throws when items returned are insufficient', async () => {
    const repo = makeRepo({
      findAll: vi.fn().mockImplementation(async (_filters, pagination) => {
        if (pagination?.limit === 0) return { items: [], total: 10, hasMore: false };
        // Return empty items so items[0] is undefined → filtered out → length < 4
        return { items: [], total: 10, hasMore: false };
      }),
    });
    await expect(getGameChallenge(repo, 42)).rejects.toThrow(
      'Not enough Pokémon for game challenge',
    );
  });
});
