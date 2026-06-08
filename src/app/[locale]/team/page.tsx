import type { Metadata } from 'next';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getTranslations } from 'next-intl/server';
import { TeamBuilder } from '@/presentation/components/organisms/TeamBuilder';
import { getRepository } from '@/application/container';
import { getPokemonList, POKEMON_PAGE_SIZE } from '@/application/usecases/getPokemonList';
import { pokemonListQueryKey } from '@/presentation/lib/queryKeys';
import { getQueryClient } from '@/presentation/lib/getQueryClient';
import { POKEMON_TYPES } from '@/domain/entities/Pokemon';
import type { PokemonType } from '@/domain/entities/Pokemon';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('teamBuilder');
  return {
    title: t('heading'),
    description: t('subtitle'),
  };
}

export default async function TeamBuilderPage() {
  const [t, tTypes] = await Promise.all([getTranslations('teamBuilder'), getTranslations('types')]);
  const queryClient = getQueryClient();
  const repository = getRepository();

  const firstPage = await getPokemonList(repository, {
    pagination: { offset: 0, limit: POKEMON_PAGE_SIZE },
  });

  queryClient.setQueryData(
    pokemonListQueryKey({}),
    { pages: [firstPage], pageParams: [0] },
    { updatedAt: 1 },
  );

  const typeLabels = Object.fromEntries(
    POKEMON_TYPES.map((type) => [type, tTypes(type)]),
  ) as Record<PokemonType, string>;

  return (
    <div className="min-h-dvh">
      <header className="mx-auto max-w-7xl px-4 pb-4 pt-8 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-black tracking-tight text-stone-900 sm:text-4xl">
          {t('heading')}
        </h1>
        <p className="mt-1 text-sm text-stone-500">{t('subtitle')}</p>
      </header>

      <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <HydrationBoundary state={dehydrate(queryClient)}>
          <TeamBuilder typeLabels={typeLabels} />
        </HydrationBoundary>
      </div>
    </div>
  );
}
