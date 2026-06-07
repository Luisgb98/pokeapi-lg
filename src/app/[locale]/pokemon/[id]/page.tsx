import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { StatList } from '@/presentation/components/molecules/StatList';
import { PokemonDetailHeader } from '@/presentation/components/organisms/PokemonDetailHeader';
import { EvolutionChainView } from '@/presentation/components/organisms/EvolutionChainView';
import { getRepository } from '@/application/container';
import { getPokemonById, PokemonNotFoundError } from '@/application/usecases/getPokemonById';
import { routing } from '@/i18n/routing';

export async function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    Array.from({ length: 151 }, (_, i) => ({ locale, id: String(i + 1) })),
  );
}

export const dynamicParams = true;
export const revalidate = 3600;

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const numericId = parseInt(id, 10);
  if (isNaN(numericId) || numericId < 1) return {};

  try {
    const t = await getTranslations({ locale, namespace: 'detail' });
    const tMeta = await getTranslations({ locale, namespace: 'metadata' });
    const repository = getRepository();
    const { pokemon } = await getPokemonById(repository, numericId);

    return {
      title: pokemon.displayName,
      description: t('metaDescription', { name: pokemon.displayName }),
      openGraph: {
        title: `${pokemon.displayName} — ${tMeta('siteTitle')}`,
        description: t('metaDescription', { name: pokemon.displayName }),
        images: [{ url: pokemon.artwork, width: 475, height: 475, alt: pokemon.displayName }],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${pokemon.displayName} — ${tMeta('siteTitle')}`,
        images: [pokemon.artwork],
      },
    };
  } catch {
    return {};
  }
}

export default async function PokemonDetailPage({ params }: Props) {
  const { id } = await params;
  const numericId = parseInt(id, 10);

  if (isNaN(numericId) || numericId < 1) {
    notFound();
  }

  const t = await getTranslations('detail');

  let pokemon, evolutionChain;
  try {
    const repository = getRepository();
    ({ pokemon, evolutionChain } = await getPokemonById(repository, numericId));
  } catch (error) {
    if (error instanceof PokemonNotFoundError) {
      notFound();
    }
    throw error;
  }

  return (
    <div className="min-h-dvh bg-stone-50">
      <PokemonDetailHeader pokemon={pokemon} />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 font-display text-sm font-bold uppercase tracking-[0.15em] text-stone-400">
              {t('baseStats')}
            </h2>
            <StatList stats={pokemon.stats} />
          </section>

          <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <EvolutionChainView chain={evolutionChain} currentId={numericId} />
          </section>
        </div>
      </div>
    </div>
  );
}
