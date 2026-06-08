import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { ComparisonPage } from '@/presentation/components/organisms/ComparisonPage';
import { getRepository } from '@/application/container';
import { getPokemonById } from '@/application/usecases/getPokemonById';
import { pokemonDetailQueryKey } from '@/presentation/lib/queryKeys';

export const revalidate = 3600;

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ a?: string; b?: string; c?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'compare' });
  return { title: t('heading') };
}

export default async function ComparePage({ searchParams }: Props) {
  const { a, b, c } = await searchParams;

  const rawIds = [a, b, c].map((s) => parseInt(s ?? '', 10)).filter((n) => !isNaN(n) && n > 0);

  const queryClient = new QueryClient();
  const repository = getRepository();

  await Promise.all(
    rawIds.map((id) =>
      queryClient.prefetchQuery({
        queryKey: pokemonDetailQueryKey(id),
        queryFn: async () => {
          const { pokemon } = await getPokemonById(repository, id);
          return pokemon;
        },
      }),
    ),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense>
        <ComparisonPage />
      </Suspense>
    </HydrationBoundary>
  );
}
