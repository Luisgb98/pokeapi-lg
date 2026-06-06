'use client';

import { useQuery } from '@tanstack/react-query';
import type { Generation, PokemonSummary, PokemonType } from '@/domain/entities/Pokemon';

export const POKEMON_LIST_QUERY_KEY = ['pokemon', 'list'] as const;

export interface PokemonListData {
  data: PokemonSummary[];
  meta: { total: number };
}

export interface PokemonListParams {
  type?: PokemonType;
  generation?: Generation;
  search?: string;
}

function applyFilters(pokemon: PokemonSummary[], params: PokemonListParams): PokemonSummary[] {
  let result = pokemon;

  if (params.type) {
    result = result.filter((p) => p.types.includes(params.type!));
  }

  if (params.generation) {
    result = result.filter((p) => p.generation === params.generation);
  }

  if (params.search) {
    const term = params.search.toLowerCase().trim();
    result = result.filter(
      (p) => p.name.includes(term) || p.displayName.toLowerCase().includes(term),
    );
  }

  return result;
}

/**
 * Returns a filtered view of the full Pokémon list.
 * Data is seeded server-side via HydrationBoundary — no client HTTP calls are made.
 * Filtering is applied synchronously via TanStack Query's `select`.
 */
export function usePokemonList(params: PokemonListParams) {
  return useQuery({
    queryKey: POKEMON_LIST_QUERY_KEY,
    // Data always comes from the server-side prefetch. If the cache is somehow empty
    // (edge case), return an empty list rather than making a client HTTP call.
    queryFn: (): PokemonListData => ({ data: [], meta: { total: 0 } }),
    staleTime: Infinity,
    gcTime: Infinity,
    select: (cached: PokemonListData) => {
      const filtered = applyFilters(cached.data, params);
      return { data: filtered, meta: { total: filtered.length } };
    },
  });
}
