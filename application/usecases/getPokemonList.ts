import type { PokemonSummary } from '../../domain/entities/Pokemon';
import type { PokemonFilters, PokemonRepository } from '../../domain/ports/PokemonRepository';

export interface GetPokemonListInput {
  filters?: PokemonFilters;
  search?: string;
}

export interface GetPokemonListOutput {
  pokemon: PokemonSummary[];
  total: number;
}

export async function getPokemonList(
  repository: PokemonRepository,
  input: GetPokemonListInput = {},
): Promise<GetPokemonListOutput> {
  const { filters, search } = input;

  const pokemon = search
    ? await repository.searchByNameWithEvolutions(search, filters)
    : await repository.findAll(filters);

  return { pokemon, total: pokemon.length };
}
