import type { Generation, PokemonType } from '@/domain/entities/Pokemon';
import type { TypeMatchMode } from '@/domain/ports/PokemonRepository';

export interface PokemonListParams {
  types?: PokemonType[];
  generations?: Generation[];
  typeMatchMode?: TypeMatchMode;
  search?: string;
}

/** Strips undefined/empty arrays so the key stays stable when filters are cleared. */
export function normalizePokemonParams(params: PokemonListParams): PokemonListParams {
  const out: PokemonListParams = {};
  if (params.types?.length) {
    out.types = [...params.types].sort();
    if (params.types.length >= 2 && params.typeMatchMode === 'all') {
      out.typeMatchMode = 'all';
    }
  }
  if (params.generations?.length) out.generations = [...params.generations].sort();
  if (params.search?.trim()) out.search = params.search.trim();
  return out;
}

export function pokemonListQueryKey(params: PokemonListParams) {
  return ['pokemon', 'list', normalizePokemonParams(params)] as const;
}
