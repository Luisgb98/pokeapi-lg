import type { Generation, Pokemon, PokemonSummary, PokemonType } from '../entities/Pokemon';
import type { EvolutionChain } from '../entities/EvolutionChain';
import type { LearnedMove } from '../entities/Move';
import type { PokemonSpecies } from '../entities/PokemonSpecies';

export type TypeMatchMode = 'any' | 'all';

export interface PokemonFilters {
  readonly types?: readonly PokemonType[];
  readonly generations?: readonly Generation[];
  readonly typeMatchMode?: TypeMatchMode;
}

export interface PokemonPagination {
  readonly offset: number;
  readonly limit: number;
}

export interface PokemonPage {
  readonly items: PokemonSummary[];
  /** Total matching the active filters — not just the current page. */
  readonly total: number;
  readonly hasMore: boolean;
}

export interface PokemonRepository {
  /** Returns a page of lightweight summaries, optionally filtered and paginated. */
  findAll(filters?: PokemonFilters, pagination?: PokemonPagination): Promise<PokemonPage>;

  /** Returns full detail for a single Pokémon including stats. */
  findById(id: number): Promise<Pokemon | null>;

  /** Returns the evolution chain for a given chain ID. */
  findEvolutionChain(chainId: number): Promise<EvolutionChain>;

  /**
   * Returns summaries for all Pokémon that share an evolution chain with
   * any Pokémon whose name contains the search term.
   */
  searchByNameWithEvolutions(term: string, filters?: PokemonFilters): Promise<PokemonSummary[]>;

  /** Returns species metadata (flavor text, genus, egg groups, etc.) for a given locale. */
  findSpeciesData(id: number, locale: string): Promise<PokemonSpecies>;

  /** Returns the full move learnset for a Pokémon in the most recent available game. */
  findMoveLearnset(id: number): Promise<readonly LearnedMove[]>;
}
