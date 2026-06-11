import type { PokemonFilterParams } from '@/domain/entities/Pokemon';

export type PokemonListParams = PokemonFilterParams;

/** Strips undefined/empty arrays so the key stays stable when filters are cleared. */
export function normalizePokemonParams(params: PokemonListParams): PokemonListParams {
  const out: PokemonListParams = {};
  if (params.types?.length) {
    out.types = params.types.toSorted();
    if (params.types.length >= 2 && params.typeMatchMode === 'all') {
      out.typeMatchMode = 'all';
    }
  }
  if (params.generations?.length) out.generations = params.generations.toSorted();
  if (params.search?.trim()) out.search = params.search.trim();
  return out;
}

export function pokemonListQueryKey(params: PokemonListParams) {
  return ['pokemon', 'list', normalizePokemonParams(params)] as const;
}

export function pokemonDetailQueryKey(id: number) {
  return ['pokemon', 'detail', id] as const;
}

export function pokemonFormQueryKey(id: number) {
  return ['pokemon', 'form', id] as const;
}
