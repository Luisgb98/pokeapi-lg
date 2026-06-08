'use client';

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  fetchPokemonById,
  fetchPokemonFormById,
  fetchPokemonPage,
} from '@/application/actions/pokemon';
import { POKEMON_PAGE_SIZE } from '@/application/usecases/getPokemonList';
import type { PokemonPage } from '@/domain/ports/PokemonRepository';
import {
  normalizePokemonParams,
  pokemonDetailQueryKey,
  pokemonFormQueryKey,
  pokemonListQueryKey,
  type PokemonListParams,
} from '@/presentation/lib/queryKeys';

export { POKEMON_PAGE_SIZE, pokemonListQueryKey, type PokemonListParams };

export function usePokemonFormById(id: number | null) {
  return useQuery({
    queryKey: pokemonFormQueryKey(id ?? 0),
    queryFn: () => fetchPokemonFormById(id!),
    enabled: id !== null && id > 0,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

export function usePokemonById(id: number | null) {
  return useQuery({
    queryKey: pokemonDetailQueryKey(id ?? 0),
    queryFn: () => fetchPokemonById(id!),
    enabled: id !== null && id > 0,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

export function usePokemonInfiniteList(params: PokemonListParams) {
  const normalized = normalizePokemonParams(params);

  return useInfiniteQuery({
    queryKey: pokemonListQueryKey(normalized),
    // Called for page 2+; page 0 is seeded server-side via HydrationBoundary.
    queryFn: ({ pageParam }) => fetchPokemonPage(normalized, pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (lastPage: PokemonPage, _pages, lastPageParam) =>
      lastPage.hasMore ? (lastPageParam as number) + POKEMON_PAGE_SIZE : undefined,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
