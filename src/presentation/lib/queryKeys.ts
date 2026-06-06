import type { Generation, PokemonType } from '@/domain/entities/Pokemon';

export interface PokemonListParams {
  type?: PokemonType;
  generation?: Generation;
  search?: string;
}

/** Strips undefined/empty fields so the key stays stable when filters are cleared. */
export function normalizePokemonParams(params: PokemonListParams): PokemonListParams {
  const out: PokemonListParams = {};
  if (params.type) out.type = params.type;
  if (params.generation) out.generation = params.generation;
  if (params.search?.trim()) out.search = params.search.trim();
  return out;
}

export function pokemonListQueryKey(params: PokemonListParams) {
  return ['pokemon', 'list', normalizePokemonParams(params)] as const;
}
