import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getRepository } from '@/application/container';
import { getPokemonById, PokemonNotFoundError } from '@/application/usecases/getPokemonById';
import { StatCalculator } from '@/presentation/components/organisms/StatCalculator';
import type { Pokemon } from '@/domain/entities/Pokemon';

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ id?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'statCalculator' });
  return { title: t('heading'), description: t('subtitle') };
}

const DEFAULT_ID = 25;

export default async function StatCalculatorPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;

  const rawId = parseInt(sp.id ?? '', 10);
  const requestedId = isNaN(rawId) || rawId < 1 ? DEFAULT_ID : rawId;

  const t = await getTranslations({ locale, namespace: 'statCalculator' });
  const repository = getRepository();

  let pokemon: Pokemon;
  try {
    const result = await getPokemonById(repository, requestedId);
    pokemon = result.pokemon;
  } catch (error) {
    if (error instanceof PokemonNotFoundError) {
      const fallback = await getPokemonById(repository, DEFAULT_ID);
      pokemon = fallback.pokemon;
    } else {
      throw error;
    }
  }

  const labels = {
    level: t('level'),
    nature: t('nature'),
    base: t('base'),
    iv: t('iv'),
    ev: t('ev'),
    result: t('result'),
    evTotal: t('evTotal'),
    evWarning: t('evWarning'),
    pokemonId: t('pokemonId'),
    load: t('load'),
    statHp: t('statHp'),
    statAttack: t('statAttack'),
    statDefense: t('statDefense'),
    statSpecialAttack: t('statSpecialAttack'),
    statSpecialDefense: t('statSpecialDefense'),
    statSpeed: t('statSpeed'),
  };

  return (
    <div className="min-h-dvh">
      <header className="mx-auto max-w-2xl px-4 pb-4 pt-8">
        <h1 className="font-display text-3xl font-black tracking-tight text-stone-900 sm:text-4xl dark:text-stone-50">
          {t('heading')}
        </h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{t('subtitle')}</p>
      </header>
      <div className="mx-auto max-w-2xl px-4 pb-16 pt-4">
        <StatCalculator
          pokemon={{
            id: pokemon.id,
            displayName: pokemon.displayName,
            stats: pokemon.stats,
          }}
          labels={labels}
        />
      </div>
    </div>
  );
}
