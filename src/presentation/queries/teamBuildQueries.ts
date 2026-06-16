'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchPokemonById, fetchMoveLearnset } from '@/application/actions/pokemon';
import { pokemonDetailQueryKey, pokemonLearnsetQueryKey } from '@/presentation/lib/queryKeys';

/** Fetches the full Pokémon detail (stats + abilities) for use in the build editor. */
export function usePokemonForBuild(id: number) {
  return useQuery({
    queryKey: pokemonDetailQueryKey(id),
    queryFn: () => fetchPokemonById(id),
    enabled: id > 0,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

/** Fetches the legal move learnset for a Pokémon slot in the build editor. */
export function useMoveLearnset(id: number, locale: string) {
  return useQuery({
    queryKey: pokemonLearnsetQueryKey(id, locale),
    queryFn: () => fetchMoveLearnset(id, locale),
    enabled: id > 0,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
