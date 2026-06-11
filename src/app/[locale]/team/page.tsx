import type { Metadata } from 'next';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getTranslations } from 'next-intl/server';
import { TeamBuilder } from '@/presentation/components/organisms/TeamBuilder';
import type { TeamMember } from '@/presentation/store/teamBuilderStore';
import { getRepository } from '@/application/container';
import { getPokemonList, POKEMON_PAGE_SIZE } from '@/application/usecases/getPokemonList';
import { pokemonListQueryKey } from '@/presentation/lib/queryKeys';
import { getQueryClient } from '@/presentation/lib/getQueryClient';
import { POKEMON_TYPES } from '@/domain/entities/Pokemon';
import type { PokemonType } from '@/domain/entities/Pokemon';
import { parseTeamParam } from '@/presentation/lib/teamShare';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('teamBuilder');
  return {
    title: t('heading'),
    description: t('subtitle'),
  };
}

interface Props {
  searchParams: Promise<{ team?: string }>;
}

export default async function TeamBuilderPage({ searchParams }: Props) {
  const sp = await searchParams;
  const sharedIds = parseTeamParam(sp.team);

  const [t, tTypes] = await Promise.all([getTranslations('teamBuilder'), getTranslations('types')]);
  const queryClient = getQueryClient();
  const repository = getRepository();

  const sharedMembers: TeamMember[] = [];
  if (sharedIds.length > 0) {
    const results = await Promise.allSettled(sharedIds.map((id) => repository.findById(id)));
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        const p = result.value;
        sharedMembers.push({
          id: p.id,
          name: p.name,
          displayName: p.displayName,
          types: p.types,
          sprite: p.sprite,
        });
      }
    }
  }

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
        <h1 className="font-display text-3xl font-black tracking-tight text-stone-900 sm:text-4xl dark:text-stone-50">
          {t('heading')}
        </h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{t('subtitle')}</p>
      </header>

      <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <HydrationBoundary state={dehydrate(queryClient)}>
          <TeamBuilder typeLabels={typeLabels} sharedMembers={sharedMembers} />
        </HydrationBoundary>
      </div>
    </div>
  );
}
