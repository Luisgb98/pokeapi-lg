import { Suspense } from 'react';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { getTranslations } from 'next-intl/server';
import { FilterBar } from '@/presentation/components/organisms/FilterBar';
import { PokemonGrid } from '@/presentation/components/organisms/PokemonGrid';
import { SkeletonCard } from '@/presentation/components/atoms/SkeletonCard';
import { getRepository } from '@/application/container';
import { getPokemonList, POKEMON_PAGE_SIZE } from '@/application/usecases/getPokemonList';
import { pokemonListQueryKey } from '@/presentation/lib/queryKeys';

function PokemonGridSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <div className="mb-5 h-5 w-24 animate-pulse rounded-full bg-stone-100" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {Array.from({ length: 24 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}

export default async function HomePage() {
  const t = await getTranslations('home');
  const queryClient = new QueryClient();
  const repository = getRepository();

  const firstPage = await getPokemonList(repository, {
    pagination: { offset: 0, limit: POKEMON_PAGE_SIZE },
  });

  queryClient.setQueryData(
    pokemonListQueryKey({}),
    { pages: [firstPage], pageParams: [0] },
    { updatedAt: 1 },
  );

  return (
    <div className="min-h-dvh">
      <header className="mx-auto max-w-7xl px-4 pb-4 pt-8 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-black tracking-tight text-stone-900 sm:text-4xl">
          {t('heading')}
        </h1>
        <p className="mt-1 text-sm text-stone-500">{t('subtitle')}</p>
      </header>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <FilterBar />
        <Suspense fallback={<PokemonGridSkeleton />}>
          <PokemonGrid />
        </Suspense>
      </HydrationBoundary>
    </div>
  );
}
