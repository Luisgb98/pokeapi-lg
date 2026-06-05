'use client';

import { useParams, notFound } from 'next/navigation';
import { Spinner } from '@/components/atoms/Spinner';
import { StatList } from '@/components/molecules/StatList';
import { PokemonDetailHeader } from '@/components/organisms/PokemonDetailHeader';
import { EvolutionChainView } from '@/components/organisms/EvolutionChainView';
import { usePokemonDetail } from '@/application/queries/pokemonQueries';

export default function PokemonDetailPage() {
  const { id } = useParams<{ id: string }>();
  const numericId = parseInt(id, 10);

  const { data, isLoading, error } = usePokemonDetail(numericId);

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !data?.data) {
    notFound();
  }

  const { pokemon, evolutionChain } = data.data;

  return (
    <div className="min-h-dvh bg-stone-50">
      <PokemonDetailHeader pokemon={pokemon} />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Stats */}
          <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2
              className="mb-5 text-sm font-bold uppercase tracking-[0.15em] text-stone-400"
              style={{ fontFamily: 'var(--font-syne)' }}
            >
              Base Stats
            </h2>
            <StatList stats={pokemon.stats} />
          </section>

          {/* Evolution chain */}
          <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <EvolutionChainView chain={evolutionChain} currentId={numericId} />
          </section>
        </div>
      </div>
    </div>
  );
}
