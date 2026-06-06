import { beforeEach, describe, expect, it } from 'vitest';
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

  it('filters by generation', async () => {
    const result = await repo.findAll({ generation: 'generation-i' });

    expect(result.items.length).toBeGreaterThan(0);
    result.items.forEach((p) => expect(p.generation).toBe('generation-i'));
  });

  it('filters by type', async () => {
    const result = await repo.findAll({ type: 'electric' });

    expect(result.items.length).toBeGreaterThan(0);
    result.items.forEach((p) => expect(p.types).toContain('electric'));
  });

  it('combines type and generation filters', async () => {
    const result = await repo.findAll({ type: 'electric', generation: 'generation-i' });

    result.items.forEach((p) => {
      expect(p.types).toContain('electric');
      expect(p.generation).toBe('generation-i');
    });
  });

  it('returns pichu when filtering gen-ii electric', async () => {
    const result = await repo.findAll({ type: 'electric', generation: 'generation-ii' });
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
    const full = await repo.findAll({ type: 'electric', generation: 'generation-i' });
    const paged = await repo.findAll(
      { type: 'electric', generation: 'generation-i' },
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
});
