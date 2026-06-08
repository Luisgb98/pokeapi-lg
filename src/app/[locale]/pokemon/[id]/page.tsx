import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { StatList } from '@/presentation/components/molecules/StatList';
import { StatsRadarChart } from '@/presentation/components/molecules/StatsRadarChart';
import { PokemonDetailHeader } from '@/presentation/components/organisms/PokemonDetailHeader';
import { EvolutionChainView } from '@/presentation/components/organisms/EvolutionChainView';
import { TypeMatchupTable } from '@/presentation/components/organisms/TypeMatchupTable';
import { getRepository } from '@/application/container';
import { getPokemonById, PokemonNotFoundError } from '@/application/usecases/getPokemonById';
import { getMoveLearnset } from '@/application/usecases/getMoveLearnset';
import { getSpeciesData } from '@/application/usecases/getSpeciesData';
import { POKEMON_TYPES } from '@/domain/entities/Pokemon';
import { MoveLearnsetTable } from '@/presentation/components/organisms/MoveLearnsetTable';
import { SpeciesInfoSection } from '@/presentation/components/organisms/SpeciesInfoSection';
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
  const { locale, id } = await params;
  const { from } = await searchParams;
  const numericId = parseInt(id, 10);

  if (isNaN(numericId) || numericId < 1) {
    notFound();
  }

  const t = await getTranslations('detail');
  const tTypes = await getTranslations('types');
  const tTypeChart = await getTranslations('typeChart');
  const tSpecies = await getTranslations('species');

  let pokemon, evolutionChain, species, learnset;
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
  } catch (error) {
    if (error instanceof PokemonNotFoundError) {
      notFound();
    }
    throw error;
  }

  const typeLabels = Object.fromEntries(
    POKEMON_TYPES.map((type) => [type, tTypes(type)]),
  ) as Record<(typeof POKEMON_TYPES)[number], string>;

  return (
    <div className="min-h-dvh bg-stone-50">
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

          <section className="min-w-0 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 font-display text-sm font-bold uppercase tracking-[0.15em] text-stone-400">
              {t('baseStats')}
            </h2>
            <StatsRadarChart stats={pokemon.stats} />
            <div className="mt-5">
              <StatList stats={pokemon.stats} />
            </div>
          </section>

          <section className="min-w-0 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
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
