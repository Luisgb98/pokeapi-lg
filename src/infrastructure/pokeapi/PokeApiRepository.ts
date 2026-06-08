import type { EvolutionChain } from '../../domain/entities/EvolutionChain';
import { flattenChainNames } from '../../domain/entities/EvolutionChain';
import type { LearnedMove, LearnMethod } from '../../domain/entities/Move';
import { LEARN_METHODS } from '../../domain/entities/Move';
import type {
  Generation,
  Pokemon,
  PokemonSummary,
  PokemonType,
} from '../../domain/entities/Pokemon';
import {
  extractIdFromUrl,
  GENERATIONS,
  getGenerationFromId,
  POKEMON_TYPES,
} from '../../domain/entities/Pokemon';
import type { PokemonSpecies } from '../../domain/entities/PokemonSpecies';
import type {
  PokemonFilters,
  PokemonPage,
  PokemonPagination,
  PokemonRepository,
} from '../../domain/ports/PokemonRepository';
import { getOrFetch, TtlCache } from './cache';
import {
  mapEvolutionChain,
  mapMove,
  mapPokemon,
  mapPokemonSpecies,
  mapPokemonSummary,
} from './mappers';
import type {
  PokeApiEvolutionChain,
  PokeApiMove,
  PokeApiNamedResource,
  PokeApiPaginatedResponse,
  PokeApiPokemon,
  PokeApiSpecies,
  PokeApiTypeDetail,
} from './types';

const BASE_URL = 'https://pokeapi.co/api/v2';

/** How long to cache list/index data — 1 hour */
const LIST_TTL = 60 * 60 * 1000;
/** How long to cache individual pokemon — 30 minutes */
const DETAIL_TTL = 30 * 60 * 1000;

/** Version groups ordered from newest to oldest — used to pick the most current learnset. */
const VERSION_GROUP_PRIORITY: readonly string[] = [
  'scarlet-violet',
  'sword-shield',
  'brilliant-diamond-and-shining-pearl',
  'legends-arceus',
  'ultra-sun-ultra-moon',
  'sun-moon',
  'omega-ruby-alpha-sapphire',
  'x-y',
  'black-2-white-2',
  'black-white',
  'heartgold-soulsilver',
  'platinum',
  'diamond-pearl',
  'firered-leafgreen',
  'emerald',
  'ruby-sapphire',
  'crystal',
  'gold-silver',
  'red-blue',
  'yellow',
];

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) {
    throw new Error(`PokeAPI error ${res.status} for ${url}`);
  }
  return res.json() as Promise<T>;
}

export class PokeApiRepository implements PokemonRepository {
  /** Full list of all named Pokémon (name + url) — fetched once */
  private readonly allPokemonCache = new TtlCache<'all', PokeApiNamedResource[]>(LIST_TTL);
  /** type-name → list of pokemon ids in that type */
  private readonly typeCache = new TtlCache<PokemonType, Set<number>>(LIST_TTL);
  /** pokemon id → full PokeApiPokemon */
  private readonly pokemonCache = new TtlCache<number, PokeApiPokemon>(DETAIL_TTL);
  /** species id → PokeApiSpecies */
  private readonly speciesCache = new TtlCache<number, PokeApiSpecies>(DETAIL_TTL);
  /** evolution chain id → mapped EvolutionChain */
  private readonly chainCache = new TtlCache<number, EvolutionChain>(DETAIL_TTL);
  /** move id → PokeApiMove */
  private readonly moveCache = new TtlCache<number, PokeApiMove>(DETAIL_TTL);

  private async fetchAllPokemon(): Promise<PokeApiNamedResource[]> {
    return getOrFetch(this.allPokemonCache, 'all', async () => {
      const data = await fetchJson<PokeApiPaginatedResponse>(`${BASE_URL}/pokemon?limit=10000`);
      return data.results;
    });
  }

  private async fetchPokemon(id: number): Promise<PokeApiPokemon> {
    return getOrFetch(this.pokemonCache, id, () =>
      fetchJson<PokeApiPokemon>(`${BASE_URL}/pokemon/${id}`),
    );
  }

  private async fetchSpecies(id: number): Promise<PokeApiSpecies> {
    return getOrFetch(this.speciesCache, id, () =>
      fetchJson<PokeApiSpecies>(`${BASE_URL}/pokemon-species/${id}`),
    );
  }

  private async fetchTypeIds(type: PokemonType): Promise<Set<number>> {
    return getOrFetch(this.typeCache, type, async () => {
      const data = await fetchJson<PokeApiTypeDetail>(`${BASE_URL}/type/${type}`);
      const ids = new Set<number>();
      for (const entry of data.pokemon) {
        const id = extractIdFromUrl(entry.pokemon.url);
        ids.add(id);
      }
      return ids;
    });
  }

  async findAll(filters?: PokemonFilters, pagination?: PokemonPagination): Promise<PokemonPage> {
    const all = await this.fetchAllPokemon();

    let filtered = all.filter((p) => {
      const id = extractIdFromUrl(p.url);
      // exclude non-standard forms (id > 10000 are alternate forms)
      return id <= 10000;
    });

    // generation filter: cheap — derive from ID range (OR across selected gens)
    if (filters?.generations?.length) {
      filtered = filtered.filter((p) => {
        const id = extractIdFromUrl(p.url);
        return filters.generations!.some((g) => getGenerationFromId(id) === g);
      });
    }

    // type filter: fetch all selected type ID sets in parallel
    // 'any' (default) → union (OR); 'all' → intersection (AND)
    if (filters?.types?.length) {
      const typeSets = await Promise.all(filters.types.map((t) => this.fetchTypeIds(t)));
      const matchIds =
        filters.typeMatchMode === 'all'
          ? typeSets.reduce((acc, s) => new Set([...acc].filter((id) => s.has(id))))
          : new Set(typeSets.flatMap((s) => [...s]));
      filtered = filtered.filter((p) => matchIds.has(extractIdFromUrl(p.url)));
    }

    const total = filtered.length;

    // Slice to the requested page before fetching individual details.
    // Without pagination, fetch all (used in tests and search fallback).
    const { offset = 0, limit = total } = pagination ?? {};
    const page = filtered.slice(offset, offset + limit);
    const hasMore = offset + limit < total;

    // Fetch full pokemon data in batches to avoid overwhelming the API
    const BATCH_SIZE = 20;
    const summaries: PokemonSummary[] = [];

    for (let i = 0; i < page.length; i += BATCH_SIZE) {
      const batch = page.slice(i, i + BATCH_SIZE);
      const pokemonData = await Promise.all(
        batch.map((p) => this.fetchPokemon(extractIdFromUrl(p.url))),
      );
      summaries.push(...pokemonData.map(mapPokemonSummary));
    }

    return { items: summaries.sort((a, b) => a.id - b.id), total, hasMore };
  }

  async findById(id: number): Promise<Pokemon | null> {
    try {
      const rawPokemon = await this.fetchPokemon(id);
      const speciesId = extractIdFromUrl(rawPokemon.species.url);
      const species = await this.fetchSpecies(speciesId);
      const chainId = extractIdFromUrl(species.evolution_chain.url);
      return mapPokemon(rawPokemon, chainId);
    } catch {
      return null;
    }
  }

  async findSpeciesData(id: number, locale: string): Promise<PokemonSpecies> {
    const raw = await this.fetchSpecies(id);
    return mapPokemonSpecies(raw, locale);
  }

  async findEvolutionChain(chainId: number): Promise<EvolutionChain> {
    return getOrFetch(this.chainCache, chainId, async () => {
      const raw = await fetchJson<PokeApiEvolutionChain>(`${BASE_URL}/evolution-chain/${chainId}`);
      return mapEvolutionChain(raw);
    });
  }

  async findMoveLearnset(id: number): Promise<readonly LearnedMove[]> {
    const rawPokemon = await this.fetchPokemon(id);
    const rawMoves = rawPokemon.moves ?? [];

    // Find the most recent version group that has data for this Pokémon
    const allVersionGroups = new Set(
      rawMoves.flatMap((m) => m.version_group_details.map((d) => d.version_group.name)),
    );
    const currentVersion =
      VERSION_GROUP_PRIORITY.find((vg) => allVersionGroups.has(vg)) ??
      (allVersionGroups.values().next().value as string | undefined);

    if (!currentVersion) return [];

    // Build (moveId, learnMethod, levelLearnedAt) tuples for the current version
    const supported = new Set<string>(LEARN_METHODS);
    const seen = new Set<string>();
    const entries: Array<{ moveId: number; learnMethod: LearnMethod; levelLearnedAt: number }> = [];

    for (const moveEntry of rawMoves) {
      const details = moveEntry.version_group_details.filter(
        (d) => d.version_group.name === currentVersion && supported.has(d.move_learn_method.name),
      );
      for (const detail of details) {
        const moveId = extractIdFromUrl(moveEntry.move.url);
        const learnMethod = detail.move_learn_method.name as LearnMethod;
        const key = `${moveId}-${learnMethod}`;
        if (seen.has(key)) continue;
        seen.add(key);
        entries.push({ moveId, learnMethod, levelLearnedAt: detail.level_learned_at });
      }
    }

    if (entries.length === 0) return [];

    // Batch-fetch all unique move details (each hit is individually cached)
    const uniqueMoveIds = [...new Set(entries.map((e) => e.moveId))];
    const moveDetails = await Promise.all(
      uniqueMoveIds.map((moveId) =>
        getOrFetch(this.moveCache, moveId, () =>
          fetchJson<PokeApiMove>(`${BASE_URL}/move/${moveId}`),
        ),
      ),
    );
    const moveById = new Map(moveDetails.map((m) => [m.id, mapMove(m)]));

    return entries.flatMap((entry) => {
      const move = moveById.get(entry.moveId);
      if (!move) return [];
      return [{ move, learnMethod: entry.learnMethod, levelLearnedAt: entry.levelLearnedAt }];
    });
  }

  async searchByNameWithEvolutions(
    term: string,
    filters?: PokemonFilters,
  ): Promise<PokemonSummary[]> {
    const normalizedTerm = term.toLowerCase().trim();
    if (!normalizedTerm) return (await this.findAll(filters)).items;

    const all = await this.fetchAllPokemon();

    // Step 1: find pokemon whose names contain the search term
    const directMatches = all.filter(
      (p) => extractIdFromUrl(p.url) <= 10000 && p.name.includes(normalizedTerm),
    );

    if (directMatches.length === 0) return [];

    // Step 2: fetch species for each match to get evolution chain IDs
    const matchIds = directMatches.map((p) => extractIdFromUrl(p.url));
    const speciesData = await Promise.all(matchIds.map((id) => this.fetchSpecies(id)));

    // Step 3: deduplicate chain IDs and fetch each chain once
    const uniqueChainIds = [
      ...new Set(speciesData.map((s) => extractIdFromUrl(s.evolution_chain.url))),
    ];
    const chains = await Promise.all(uniqueChainIds.map((id) => this.findEvolutionChain(id)));

    // Step 4: collect all pokemon names from all chains
    const allNamesInChains = new Set(chains.flatMap((c) => flattenChainNames(c.chain)));

    // Step 5: filter main list to just those names, then apply other filters
    const expanded = all.filter(
      (p) => extractIdFromUrl(p.url) <= 10000 && allNamesInChains.has(p.name),
    );

    // Apply generation/type filters on top
    let result = expanded;

    if (filters?.generations?.length) {
      result = result.filter((p) =>
        filters.generations!.some((g) => getGenerationFromId(extractIdFromUrl(p.url)) === g),
      );
    }

    if (filters?.types?.length) {
      const typeSets = await Promise.all(filters.types.map((t) => this.fetchTypeIds(t)));
      const matchIds =
        filters.typeMatchMode === 'all'
          ? typeSets.reduce((acc, s) => new Set([...acc].filter((id) => s.has(id))))
          : new Set(typeSets.flatMap((s) => [...s]));
      result = result.filter((p) => matchIds.has(extractIdFromUrl(p.url)));
    }

    // Fetch summaries in batches
    const BATCH_SIZE = 20;
    const summaries: PokemonSummary[] = [];
    for (let i = 0; i < result.length; i += BATCH_SIZE) {
      const batch = result.slice(i, i + BATCH_SIZE);
      const pokemonData = await Promise.all(
        batch.map((p) => this.fetchPokemon(extractIdFromUrl(p.url))),
      );
      summaries.push(...pokemonData.map(mapPokemonSummary));
    }

    return summaries.sort((a, b) => a.id - b.id);
  }
}

export const VALID_TYPES: readonly PokemonType[] = POKEMON_TYPES;
export const VALID_GENERATIONS: readonly Generation[] = GENERATIONS;
