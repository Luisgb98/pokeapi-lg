import type { Generation, Pokemon, PokemonSummary, PokemonType } from '../entities/Pokemon';
import type { EvolutionChain } from '../entities/EvolutionChain';

export interface PokemonFilters {
  readonly type?: PokemonType;
  readonly generation?: Generation;
}

export interface PokemonRepository {
  /** Returns lightweight summaries for all Pokémon, optionally filtered. */
  findAll(filters?: PokemonFilters): Promise<PokemonSummary[]>;

  /** Returns full detail for a single Pokémon including stats. */
  findById(id: number): Promise<Pokemon | null>;

  /** Returns the evolution chain for a given chain ID. */
  findEvolutionChain(chainId: number): Promise<EvolutionChain>;

  /**
   * Returns summaries for all Pokémon that share an evolution chain with
   * any Pokémon whose name contains the search term.
   */
  searchByNameWithEvolutions(term: string, filters?: PokemonFilters): Promise<PokemonSummary[]>;
}
