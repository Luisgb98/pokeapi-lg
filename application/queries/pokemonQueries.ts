'use client';

import { useQuery } from '@tanstack/react-query';
import type { Generation, PokemonSummary, PokemonType } from '../../domain/entities/Pokemon';
import type { Pokemon } from '../../domain/entities/Pokemon';
import type { EvolutionChain } from '../../domain/entities/EvolutionChain';

interface ListResponse {
  success: boolean;
  data: PokemonSummary[];
  meta: { total: number };
  error?: string;
}

interface DetailResponse {
  success: boolean;
  data: { pokemon: Pokemon; evolutionChain: EvolutionChain };
  error?: string;
}

export interface PokemonListParams {
  type?: PokemonType;
  generation?: Generation;
  search?: string;
}

export function usePokemonList(params: PokemonListParams) {
  const queryParams = new URLSearchParams();
  if (params.type) queryParams.set('type', params.type);
  if (params.generation) queryParams.set('generation', params.generation);
  if (params.search) queryParams.set('search', params.search);

  return useQuery({
    queryKey: ['pokemon', 'list', params],
    queryFn: async (): Promise<ListResponse> => {
      const res = await fetch(`/api/pokemon?${queryParams}`);
      const data: ListResponse = await res.json();
      if (!data.success) throw new Error(data.error ?? 'Failed to fetch list');
      return data;
    },
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}

export function usePokemonDetail(id: number) {
  return useQuery({
    queryKey: ['pokemon', 'detail', id],
    queryFn: async (): Promise<DetailResponse> => {
      const res = await fetch(`/api/pokemon/${id}`);
      const data: DetailResponse = await res.json();
      if (!data.success) throw new Error(data.error ?? 'Failed to fetch detail');
      return data;
    },
    staleTime: 10 * 60 * 1000,
    enabled: id > 0,
  });
}
