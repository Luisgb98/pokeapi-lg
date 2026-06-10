'use client';

import { useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useDebounce } from '@/presentation/hooks/useDebounce';
import { useHydration } from '@/presentation/hooks/useHydration';
import { useInfiniteScroll } from '@/presentation/hooks/useInfiniteScroll';
import { useFavoritesStore } from '@/presentation/store/favoritesStore';
import { usePokemonStore } from '@/presentation/store/pokemonStore';
import { usePokemonInfiniteList } from '@/presentation/queries/pokemonQueries';
import { PokemonCard } from '@/presentation/components/molecules/PokemonCard';
import { SkeletonCard } from '@/presentation/components/atoms/SkeletonCard';
import { Spinner } from '@/presentation/components/atoms/Spinner';
import type { PokemonType, Generation } from '@/domain/entities/Pokemon';

export function PokemonGrid() {
  const t = useTranslations('grid');
  const tFav = useTranslations('favorites');
  const {
    search,
    types,
    generations,
    typeMatchMode,
    showFavoritesOnly,
    scrollY,
    restoreCount,
    setNavState,
  } = usePokemonStore();
  const hydrated = useHydration();
  const favoriteIds = useFavoritesStore((s) => s.ids);
  const debouncedSearch = useDebounce(search, 320);

  const params = {
    types: types as PokemonType[],
    generations: generations as Generation[],
    typeMatchMode,
    search: debouncedSearch.length >= 2 ? debouncedSearch : undefined,
  };

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, error } =
    usePokemonInfiniteList(params);

  const pokemon = data?.pages.flatMap((p) => p.items) ?? [];
  const total = data?.pages.at(-1)?.total ?? 0;

  const visiblePokemon =
    hydrated && showFavoritesOnly ? pokemon.filter((p) => favoriteIds.includes(p.id)) : pokemon;

  const handleFetchNext = useCallback(() => {
    void fetchNextPage();
  }, [fetchNextPage]);

  const sentinelRef = useInfiniteScroll(handleFetchNext, !!hasNextPage && !isFetchingNextPage);

  const handleCardClick = () => {
    setNavState(window.scrollY, pokemon.length);
  };

  useEffect(() => {
    if (scrollY <= 0) return;
    let rafId: number;
    let attempts = 0;
    const restore = () => {
      window.scrollTo({ top: scrollY, behavior: 'instant' });
      if (window.scrollY < scrollY - 5 && attempts++ < 8) {
        rafId = requestAnimationFrame(restore);
      }
    };
    rafId = requestAnimationFrame(restore);
    return () => cancelAnimationFrame(rafId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-lg font-semibold text-stone-700 dark:text-stone-300">
          {t('errorTitle')}
        </p>
        <p className="mt-1 text-sm text-stone-400 dark:text-stone-500">
          {(error as Error).message}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <div className="mb-5 flex items-center gap-2">
        <span className="font-mono text-sm font-medium text-stone-900 dark:text-stone-100">
          {isLoading ? '—' : total.toLocaleString()}
        </span>
        <span className="text-sm text-stone-400 dark:text-stone-500">
          Pokémon
          {debouncedSearch && ` ${t('matchingSearch', { query: debouncedSearch })}`}
        </span>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 24 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : hydrated && showFavoritesOnly && visiblePokemon.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <span className="mb-3 text-5xl">♡</span>
          <p className="text-base font-semibold text-stone-700 dark:text-stone-300">
            {tFav('empty')}
          </p>
          <p className="mt-1 text-sm text-stone-400">{tFav('emptyHint')}</p>
        </div>
      ) : pokemon.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <span className="mb-3 text-5xl">🔍</span>
          <p className="text-base font-semibold text-stone-700 dark:text-stone-300">
            {t('noResults')}
          </p>
          <p className="mt-1 text-sm text-stone-400">{t('noResultsHint')}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {visiblePokemon.map((p, i) => (
              <PokemonCard
                key={p.id}
                pokemon={p}
                index={i}
                onClick={handleCardClick}
                animate={scrollY === 0 || i >= restoreCount}
              />
            ))}
          </div>

          <div ref={sentinelRef} aria-hidden="true" className="h-1" />

          {isFetchingNextPage && (
            <div className="flex justify-center py-8">
              <Spinner size="md" />
            </div>
          )}

          {!hasNextPage && pokemon.length > 0 && (
            <p className="mt-8 text-center font-mono text-xs text-stone-400">
              {t('allLoaded', { count: total.toLocaleString() })}
            </p>
          )}
        </>
      )}
    </div>
  );
}
