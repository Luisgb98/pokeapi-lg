import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PokeApiRepository } from '../../infrastructure/pokeapi/PokeApiRepository';

let repo: PokeApiRepository;

beforeEach(() => {
  repo = new PokeApiRepository();
});

describe('findAll', () => {
  it('returns pokemon sorted by ID', async () => {
    const result = await repo.findAll();

    expect(result.items.length).toBeGreaterThan(0);
    for (let i = 1; i < result.items.length; i++) {
      expect(result.items[i].id).toBeGreaterThan(result.items[i - 1].id);
    }
  });

  it('filters by a single generation', async () => {
    const result = await repo.findAll({ generations: ['generation-i'] });

    expect(result.items.length).toBeGreaterThan(0);
    result.items.forEach((p) => expect(p.generation).toBe('generation-i'));
  });

  it('filters by multiple generations (OR logic)', async () => {
    const result = await repo.findAll({ generations: ['generation-i', 'generation-ii'] });

    expect(result.items.length).toBeGreaterThan(0);
    result.items.forEach((p) => expect(['generation-i', 'generation-ii']).toContain(p.generation));
  });

  it('filters by a single type', async () => {
    const result = await repo.findAll({ types: ['electric'] });

    expect(result.items.length).toBeGreaterThan(0);
    result.items.forEach((p) => expect(p.types).toContain('electric'));
  });

  it('filters by multiple types AND logic (intersection)', async () => {
    // electric ∩ grass → no Pokémon in fixture has both types → empty
    const result = await repo.findAll({ types: ['electric', 'grass'], typeMatchMode: 'all' });
    expect(result.total).toBe(0);
    expect(result.items).toHaveLength(0);
  });

  it('filters by multiple types (OR logic)', async () => {
    // electric → pikachu, raichu, pichu (3); grass → bulbasaur (1); combined → all 4
    const electricResult = await repo.findAll({ types: ['electric'] });
    const grassResult = await repo.findAll({ types: ['grass'] });
    const bothResult = await repo.findAll({ types: ['electric', 'grass'] });

    expect(electricResult.total).toBe(3);
    expect(grassResult.total).toBe(1);
    expect(bothResult.total).toBe(4);
    expect(bothResult.total).toBeGreaterThan(electricResult.total);
    expect(bothResult.total).toBeGreaterThan(grassResult.total);
  });

  it('combines type and generation filters', async () => {
    const result = await repo.findAll({ types: ['electric'], generations: ['generation-i'] });

    result.items.forEach((p) => {
      expect(p.types).toContain('electric');
      expect(p.generation).toBe('generation-i');
    });
  });

  it('returns pichu when filtering gen-ii electric', async () => {
    const result = await repo.findAll({ types: ['electric'], generations: ['generation-ii'] });
    const names = result.items.map((p) => p.name);
    expect(names).toContain('pichu');
  });

  it('paginates results with correct total and hasMore', async () => {
    const result = await repo.findAll(undefined, { offset: 0, limit: 1 });

    expect(result.items).toHaveLength(1);
    expect(result.total).toBeGreaterThan(1);
    expect(result.hasMore).toBe(true);
  });

  it('returns hasMore false when all results fit in the page', async () => {
    const full = await repo.findAll({ types: ['electric'], generations: ['generation-i'] });
    const paged = await repo.findAll(
      { types: ['electric'], generations: ['generation-i'] },
      { offset: 0, limit: full.total },
    );

    expect(paged.hasMore).toBe(false);
    expect(paged.total).toBe(full.total);
  });
});

describe('findById', () => {
  it('returns full pokemon with stats', async () => {
    const result = await repo.findById(25);

    expect(result).not.toBeNull();
    expect(result!.id).toBe(25);
    expect(result!.name).toBe('pikachu');
    expect(result!.stats.hp).toBe(35);
    expect(result!.stats.speed).toBe(90);
    expect(result!.evolutionChainId).toBe(10);
  });

  it('returns null for unknown id (error from API is swallowed)', async () => {
    const result = await repo.findById(25);
    expect(result).not.toBeNull();
  });

  describe('error handling', () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('returns null when the API responds with 404', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }));
      const result = await repo.findById(99999);
      expect(result).toBeNull();
    });

    it('rethrows when the API responds with a non-404 error', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }));
      await expect(repo.findById(25)).rejects.toThrow('PokeAPI error 500');
    });
  });
});

describe('findEvolutionChain', () => {
  it('returns the correct evolution chain', async () => {
    const chain = await repo.findEvolutionChain(10);

    expect(chain.id).toBe(10);
    expect(chain.chain.name).toBe('pichu');
    expect(chain.chain.evolvesTo[0].name).toBe('pikachu');
    expect(chain.chain.evolvesTo[0].evolvesTo[0].name).toBe('raichu');
  });
});

describe('findSpeciesData', () => {
  it('returns species data for the given id and locale', async () => {
    const result = await repo.findSpeciesData(25, 'en');
    expect(result.eggGroups).toEqual(['field', 'fairy']);
    expect(result.captureRate).toBe(190);
    expect(result.genderRate).toBe(4);
  });

  it('returns locale-specific genus', async () => {
    const result = await repo.findSpeciesData(25, 'es');
    expect(result.genus).toBe('Ratón Pokémon');
  });
});

describe('findMoveLearnset', () => {
  it('returns learned moves for a pokemon', async () => {
    const result = await repo.findMoveLearnset(25);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].move.name).toBe('thundershock');
    expect(result[0].learnMethod).toBe('level-up');
    expect(result[0].levelLearnedAt).toBe(1);
  });

  it('returns empty array for a pokemon with no moves', async () => {
    const result = await repo.findMoveLearnset(172);
    expect(result).toEqual([]);
  });
});

describe('searchByNameWithEvolutions', () => {
  it('returns direct match + full evolution chain', async () => {
    const result = await repo.searchByNameWithEvolutions('pikachu');
    const names = result.map((p) => p.name);

    expect(names).toContain('pikachu');
    expect(names).toContain('pichu');
    expect(names).toContain('raichu');
  });

  it('returns empty array for no matches', async () => {
    const result = await repo.searchByNameWithEvolutions('xyznotapokemon');
    expect(result).toEqual([]);
  });

  it('returns all pokemon (no evolution expansion) for empty string', async () => {
    const result = await repo.searchByNameWithEvolutions('');
    expect(result.length).toBeGreaterThan(0);
  });

  it('results are sorted by ID', async () => {
    const result = await repo.searchByNameWithEvolutions('pika');
    for (let i = 1; i < result.length; i++) {
      expect(result[i].id).toBeGreaterThan(result[i - 1].id);
    }
  });

  it('filters results by type when a types filter is provided', async () => {
    const result = await repo.searchByNameWithEvolutions('pikachu', { types: ['electric'] });
    expect(result.length).toBeGreaterThan(0);
    result.forEach((p) => expect(p.types).toContain('electric'));
  });

  it('returns empty array when type filter excludes all chain members', async () => {
    const result = await repo.searchByNameWithEvolutions('pikachu', { types: ['grass'] });
    expect(result).toEqual([]);
  });

  it('returns no duplicate pokemon when multiple name matches share an evolution chain', async () => {
    // 'chu' matches pikachu, pichu, and raichu — all members of chain 10.
    // The chain should be fetched once; no member should appear twice.
    const result = await repo.searchByNameWithEvolutions('chu');
    const ids = result.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
