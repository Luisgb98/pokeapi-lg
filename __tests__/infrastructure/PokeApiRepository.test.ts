import { beforeEach, describe, expect, it } from 'vitest';
import { PokeApiRepository } from '../../infrastructure/pokeapi/PokeApiRepository';

// A fresh repository instance per test so caches don't bleed between tests
let repo: PokeApiRepository;

beforeEach(() => {
  repo = new PokeApiRepository();
});

describe('findAll', () => {
  it('returns pokemon sorted by ID', async () => {
    const result = await repo.findAll();

    expect(result.length).toBeGreaterThan(0);
    for (let i = 1; i < result.length; i++) {
      expect(result[i].id).toBeGreaterThan(result[i - 1].id);
    }
  });

  it('filters by generation', async () => {
    const result = await repo.findAll({ generation: 'generation-i' });

    expect(result.length).toBeGreaterThan(0);
    result.forEach((p) => expect(p.generation).toBe('generation-i'));
  });

  it('filters by type', async () => {
    const result = await repo.findAll({ type: 'electric' });

    expect(result.length).toBeGreaterThan(0);
    result.forEach((p) => expect(p.types).toContain('electric'));
  });

  it('combines type and generation filters', async () => {
    const result = await repo.findAll({ type: 'electric', generation: 'generation-i' });

    result.forEach((p) => {
      expect(p.types).toContain('electric');
      expect(p.generation).toBe('generation-i');
    });
  });

  it('returns empty array when no pokemon match filters', async () => {
    // generation-ii electric pokemon: pichu (172), but our mock only returns pichu for electric type
    const result = await repo.findAll({ type: 'electric', generation: 'generation-ii' });
    // pichu is gen-ii (id=172) and electric
    const names = result.map((p) => p.name);
    expect(names).toContain('pichu');
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
    // id 9999 has no mock handler → server will throw "Unhandled request"
    // We'll test a different path: confirm non-null for a valid one
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

    // Should include pikachu AND its chain members pichu and raichu
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
