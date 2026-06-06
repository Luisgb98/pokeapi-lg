'use server';
import type { Generation, PokemonType } from '@/domain/entities/Pokemon';
import { getRepository } from '../container';
import { getPokemonList, POKEMON_PAGE_SIZE } from '../usecases/getPokemonList';

// Mirrors presentation/queries/pokemonQueries.ts PokemonListParams — structurally identical.
export interface PokemonPageParams {
  type?: PokemonType;
  generation?: Generation;
  search?: string;
}

export async function fetchPokemonPage(params: PokemonPageParams, pageParam: number) {
  const repository = getRepository();
  return getPokemonList(repository, {
    filters: { type: params.type, generation: params.generation },
    search: params.search,
    pagination: { offset: pageParam, limit: POKEMON_PAGE_SIZE },
  });
}
