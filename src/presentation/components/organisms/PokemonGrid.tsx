'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useDebounce } from '@/presentation/hooks/useDebounce';
import { useInfiniteScroll } from '@/presentation/hooks/useInfiniteScroll';
import { usePokemonStore } from '@/presentation/store/pokemonStore';
import { usePokemonInfiniteList } from '@/presentation/queries/pokemonQueries';
import { PokemonCard } from '@/presentation/components/molecules/PokemonCard';
import { SkeletonCard } from '@/presentation/components/atoms/SkeletonCard';
import { Spinner } from '@/presentation/components/atoms/Spinner';
import type { PokemonType, Generation } from '@/domain/entities/Pokemon';

export function PokemonGrid() {
  const { search, type, generation, scrollY, setScrollY } = usePokemonStore();
  const debouncedSearch = useDebounce(search, 320);

  const params = {
    type: type as PokemonType | undefined,
    generation: generation as Generation | undefined,
    search: debouncedSearch || undefined,
  };

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, error } =
    usePokemonInfiniteList(params);

  const pokemon = data?.pages.flatMap((p) => p.items) ?? [];
  const total = data?.pages.at(-1)?.total ?? 0;

  // Track which cards were already in cache at mount so we can skip re-animating them.
  // mountCountRef: 0 = animate all (fresh load), N = skip cards 0..N-1 (restoration).
  // prevParamsStr: detects filter/search changes so mountCountRef resets for new queries.
  const mountCountRef = useRef<number | null>(null);
  const prevParamsStr = useRef('');
  const currentParamsStr = `${params.type ?? ''}-${params.generation ?? ''}-${params.search ?? ''}`;
  if (prevParamsStr.current !== currentParamsStr) {
    prevParamsStr.current = currentParamsStr;
    mountCountRef.current = null;
  }
  if (mountCountRef.current === null && pokemon.length > 0) {
    mountCountRef.current = scrollY > 0 ? pokemon.length : 0;
  }

  const handleFetchNext = useCallback(() => {
    void fetchNextPage();
  }, [fetchNextPage]);

  const sentinelRef = useInfiniteScroll(handleFetchNext, !!hasNextPage && !isFetchingNextPage);

  // Save scroll BEFORE navigation starts (not during unmount — by then Next.js
  // has already reset window.scrollY to 0 as part of its Link scroll behaviour).
  const handleCardClick = useCallback(() => {
    setScrollY(window.scrollY);
  }, [setScrollY]);

  // Restore scroll on mount. Uses a retry loop because the page may not yet be
  // tall enough on the first animation frame when many cards are rendering.
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
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 24 }).map((_, i) => (
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
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {pokemon.map((p, i) => (
              <PokemonCard
                key={p.id}
                pokemon={p}
                index={i}
                onClick={handleCardClick}
                animate={
                  mountCountRef.current === null ||
                  mountCountRef.current === 0 ||
                  i >= mountCountRef.current
                }
              />
            ))}
          </div>

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} aria-hidden="true" className="h-1" />

          {/* Next-page loading indicator */}
          {isFetchingNextPage && (
            <div className="flex justify-center py-8">
              <Spinner size="md" />
            </div>
          )}

          {/* End-of-list message */}
          {!hasNextPage && pokemon.length > 0 && (
            <p className="mt-8 text-center font-mono text-xs text-stone-400">
              All {total.toLocaleString()} Pokémon loaded
            </p>
          )}
        </>
      )}
    </div>
  );
}
