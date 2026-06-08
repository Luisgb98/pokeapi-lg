import type {
  PokemonFilters,
  PokemonPage,
  PokemonPagination,
  PokemonRepository,
} from '../../domain/ports/PokemonRepository';

/** How many Pokémon to load per infinite-scroll page. */
export const POKEMON_PAGE_SIZE = 24;

export interface GetPokemonListInput {
  filters?: PokemonFilters;
  search?: string;
  pagination?: PokemonPagination;
}

export async function getPokemonList(
  repository: PokemonRepository,
  input: GetPokemonListInput = {},
): Promise<PokemonPage> {
  const { filters, search, pagination } = input;

  if (search) {
    const allResults = await repository.searchByNameWithEvolutions(search, filters);
    if (!pagination) {
      return { items: allResults, total: allResults.length, hasMore: false };
    }
    const { offset, limit } = pagination;
    return {
      items: allResults.slice(offset, offset + limit),
      total: allResults.length,
      hasMore: offset + limit < allResults.length,
    };
  }

  return repository.findAll(filters, pagination);
}
