'use client';

import { useTranslations } from 'next-intl';
import { useQueries } from '@tanstack/react-query';
import { fetchPokemonById } from '@/application/actions/pokemon';
import { pokemonDetailQueryKey } from '@/presentation/lib/queryKeys';
import { useHydration } from '@/presentation/hooks/useHydration';
import { useFavoritesStore } from '@/presentation/store/favoritesStore';
import { PokemonCard } from '@/presentation/components/molecules/PokemonCard';
import { SkeletonCard } from '@/presentation/components/atoms/SkeletonCard';

export function FavoritesGrid() {
  const t = useTranslations('favorites');
  const hydrated = useHydration();
  const ids = useFavoritesStore((s) => s.ids);
  const toggle = useFavoritesStore((s) => s.toggle);

  const results = useQueries({
    queries: ids.map((id) => ({
      queryKey: pokemonDetailQueryKey(id),
      queryFn: () => fetchPokemonById(id),
      staleTime: Infinity,
      gcTime: Infinity,
    })),
  });

  if (!hydrated) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (ids.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <p className="text-xl font-semibold text-stone-700 dark:text-stone-300">{t('empty')}</p>
        <p className="text-sm text-stone-500 dark:text-stone-400">{t('emptyHint')}</p>
      </div>
    );
  }

  const isLoading = results.some((r) => r.isLoading);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {ids.map((id) => (
          <SkeletonCard key={id} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {results.map((result, i) => {
        if (!result.data) return null;
        const pokemon = result.data;
        return (
          <PokemonCard
            key={pokemon.id}
            pokemon={pokemon}
            index={i}
            isFavorite={true}
            onToggleFavorite={toggle}
          />
        );
      })}
    </div>
  );
}
