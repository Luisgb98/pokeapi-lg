import type { Metadata } from 'next';
import { notFound, unstable_rethrow } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { StatList } from '@/presentation/components/molecules/StatList';
import { StatsRadarChart } from '@/presentation/components/molecules/StatsRadarChart';
import { PokemonDetailHeader } from '@/presentation/components/organisms/PokemonDetailHeader';
import { EvolutionChainView } from '@/presentation/components/organisms/EvolutionChainView';
import { TypeMatchupTable } from '@/presentation/components/organisms/TypeMatchupTable';
import { getRepository } from '@/application/container';
import { getAbilities } from '@/application/usecases/getAbilities';
import { getPokemonById, PokemonNotFoundError } from '@/application/usecases/getPokemonById';
import { getMoveLearnset } from '@/application/usecases/getMoveLearnset';
import { getSpeciesData } from '@/application/usecases/getSpeciesData';
import { POKEMON_TYPES } from '@/domain/entities/Pokemon';
import { MoveLearnsetTable } from '@/presentation/components/organisms/MoveLearnsetTable';
import { PokemonAboutSection } from '@/presentation/components/organisms/PokemonAboutSection';
import { SpeciesInfoSection } from '@/presentation/components/organisms/SpeciesInfoSection';
import { ScrollReset } from '@/presentation/components/atoms/ScrollReset';
import { routing } from '@/i18n/routing';

export async function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    Array.from({ length: 1025 }, (_, i) => ({ locale, id: String(i + 1) })),
  );
}

export const dynamicParams = true;
export const revalidate = 3600;

interface Props {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ from?: string }>;
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
        images: [
          { url: `/api/og/${numericId}`, width: 1200, height: 630, alt: pokemon.displayName },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${pokemon.displayName} — ${tMeta('siteTitle')}`,
        images: [`/api/og/${numericId}`],
      },
    };
  } catch {
    return {};
  }
}

export default async function PokemonDetailPage({ params, searchParams }: Props) {
  const [{ locale, id }, { from }] = await Promise.all([params, searchParams]);
  const numericId = parseInt(id, 10);

  if (isNaN(numericId) || numericId < 1) {
    notFound();
  }

  const [t, tTypes, tTypeChart, tSpecies, tAbout] = await Promise.all([
    getTranslations('detail'),
    getTranslations('types'),
    getTranslations('typeChart'),
    getTranslations('species'),
    getTranslations('about'),
  ]);

  let pokemon, evolutionChain, species, learnset, abilities;
  try {
    const repository = getRepository();
    const [pokemonResult, speciesResult, learnsetResult] = await Promise.all([
      getPokemonById(repository, numericId),
      getSpeciesData(repository, numericId, locale),
      getMoveLearnset(repository, numericId),
    ]);
    pokemon = pokemonResult.pokemon;
    evolutionChain = pokemonResult.evolutionChain;
    species = speciesResult;
    learnset = learnsetResult;
    abilities = await getAbilities(repository, pokemon.abilities, locale);
  } catch (error) {
    unstable_rethrow(error);
    if (error instanceof PokemonNotFoundError) {
      notFound();
    }
    throw error;
  }

  const typeLabels = Object.fromEntries(
    POKEMON_TYPES.map((type) => [type, tTypes(type)]),
  ) as Record<(typeof POKEMON_TYPES)[number], string>;

  return (
    <div className="min-h-dvh bg-stone-50 dark:bg-stone-950">
      <ScrollReset />
      <PokemonDetailHeader pokemon={pokemon} backTo={from} varieties={species.varieties} />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <SpeciesInfoSection
            species={species}
            labels={{
              section: tSpecies('section'),
              genus: tSpecies('genus'),
              eggGroups: tSpecies('eggGroups'),
              captureRate: tSpecies('captureRate'),
              baseHappiness: tSpecies('baseHappiness'),
              genderRatio: tSpecies('genderRatio'),
              genderless: tSpecies('genderless'),
              male: tSpecies('male'),
              female: tSpecies('female'),
            }}
          />

          <PokemonAboutSection
            height={pokemon.height}
            weight={pokemon.weight}
            abilities={abilities ?? []}
            labels={{
              section: tAbout('section'),
              height: tAbout('height'),
              weight: tAbout('weight'),
              abilities: tAbout('abilities'),
              hidden: tAbout('hidden'),
            }}
          />

          <section className="min-w-0 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-700 dark:bg-stone-900">
            <h2 className="mb-5 font-display text-sm font-bold uppercase tracking-[0.15em] text-stone-400 dark:text-stone-500">
              {t('baseStats')}
            </h2>
            <StatsRadarChart stats={pokemon.stats} />
            <div className="mt-5">
              <StatList stats={pokemon.stats} />
            </div>
          </section>

          <section className="min-w-0 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-700 dark:bg-stone-900">
            <EvolutionChainView chain={evolutionChain} currentId={numericId} />
          </section>

          <div className="min-w-0 lg:col-span-2">
            <TypeMatchupTable
              types={pokemon.types}
              typeLabels={typeLabels}
              labels={{
                title: tTypeChart('title'),
                weaknesses: tTypeChart('weaknesses'),
                resistances: tTypeChart('resistances'),
                weakX4: tTypeChart('weakX4'),
                weakX2: tTypeChart('weakX2'),
                resistHalf: tTypeChart('resistHalf'),
                resistQuarter: tTypeChart('resistQuarter'),
                immune: tTypeChart('immune'),
              }}
            />
          </div>

          {learnset.length > 0 && (
            <div className="min-w-0 lg:col-span-2">
              <MoveLearnsetTable learnset={learnset} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
