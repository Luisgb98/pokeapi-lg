'use client';

import { useDebounce } from '@/presentation/hooks/useDebounce';
import { usePokemonStore } from '@/presentation/store/pokemonStore';
import { usePokemonList } from '@/presentation/queries/pokemonQueries';
import { PokemonCard } from '@/presentation/components/molecules/PokemonCard';
import { SkeletonCard } from '@/presentation/components/atoms/SkeletonCard';
import { Spinner } from '@/presentation/components/atoms/Spinner';
import type { PokemonType } from '@/domain/entities/Pokemon';
import type { Generation } from '@/domain/entities/Pokemon';

export function PokemonGrid() {
  const { search, type, generation } = usePokemonStore();
  const debouncedSearch = useDebounce(search, 320);

  const { data, isLoading, isFetching, error } = usePokemonList({
    type: type as PokemonType | undefined,
    generation: generation as Generation | undefined,
    search: debouncedSearch || undefined,
  });

  const pokemon = data?.data ?? [];
  const total = data?.meta.total ?? 0;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-lg font-semibold text-stone-700">Something went wrong</p>
        <p className="mt-1 text-sm text-stone-400">{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      {/* Results count */}
      <div className="mb-5 flex items-center gap-2">
        <span className="font-mono text-sm font-medium text-stone-900">
          {isLoading ? '—' : total.toLocaleString()}
        </span>
        <span className="text-sm text-stone-400">
          {total === 1 ? 'Pokémon' : 'Pokémon'}
          {debouncedSearch && ` matching "${debouncedSearch}"`}
        </span>
        {isFetching && !isLoading && <Spinner size="sm" className="ml-1" />}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 18 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : pokemon.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <span className="mb-3 text-5xl">🔍</span>
          <p className="text-base font-semibold text-stone-700">No Pokémon found</p>
          <p className="mt-1 text-sm text-stone-400">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {pokemon.map((p, i) => (
            <PokemonCard key={p.id} pokemon={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
