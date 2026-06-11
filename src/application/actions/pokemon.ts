'use server';
import type { Generation, Pokemon, PokemonType } from '@/domain/entities/Pokemon';
import { getRepository } from '../container';
import { getPokemonById } from '../usecases/getPokemonById';
import { getPokemonList, POKEMON_PAGE_SIZE } from '../usecases/getPokemonList';

export async function fetchPokemonById(id: number): Promise<Pokemon> {
  const repository = getRepository();
  const { pokemon } = await getPokemonById(repository, id);
  return pokemon;
}

export async function fetchPokemonFormById(id: number): Promise<Pokemon | null> {
  const repository = getRepository();
  return repository.findById(id);
}

// Mirrors presentation/queries/pokemonQueries.ts PokemonListParams — structurally identical.
export interface PokemonPageParams {
  types?: PokemonType[];
  generations?: Generation[];
  typeMatchMode?: 'any' | 'all';
  search?: string;
}

export async function fetchPokemonPage(params: PokemonPageParams, pageParam: number) {
  const repository = getRepository();
  return getPokemonList(repository, {
    filters: {
      types: params.types,
      generations: params.generations,
      typeMatchMode: params.typeMatchMode,
    },
    search: params.search,
    pagination: { offset: pageParam, limit: POKEMON_PAGE_SIZE },
  });
}
