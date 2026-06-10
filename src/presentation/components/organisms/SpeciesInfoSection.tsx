import type { PokemonSpecies } from '@/domain/entities/PokemonSpecies';
import { formatEggGroupName, getFemalePercent } from '@/domain/entities/PokemonSpecies';

export interface SpeciesLabels {
  section: string;
  genus: string;
  eggGroups: string;
  captureRate: string;
  baseHappiness: string;
  genderRatio: string;
  genderless: string;
  male: string;
  female: string;
}

interface Props {
  species: PokemonSpecies;
  labels: SpeciesLabels;
}

function formatPercent(n: number): string {
  return n % 1 === 0 ? String(n) : n.toFixed(1);
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-stone-400">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-semibold text-stone-700 dark:text-stone-200">{value}</dd>
    </div>
  );
}

export function SpeciesInfoSection({ species, labels }: Props) {
  const femalePercent = getFemalePercent(species.genderRate);
  const malePercent = femalePercent !== null ? 100 - femalePercent : null;

  return (
    <section className="min-w-0 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm lg:col-span-2 dark:border-stone-700 dark:bg-stone-900">
      <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-[0.15em] text-stone-400">
        {labels.section}
      </h2>

      {species.flavorText && (
        <blockquote className="relative mb-6 overflow-hidden rounded-xl bg-stone-50 px-5 py-4 dark:bg-stone-800">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-0 font-display text-6xl leading-none text-stone-200 select-none dark:text-stone-700"
          >
            &ldquo;
          </span>
          <p className="relative pl-5 text-[0.9375rem] italic leading-relaxed text-stone-600 dark:text-stone-300">
            {species.flavorText}
          </p>
        </blockquote>
      )}

      <dl className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 lg:grid-cols-5">
        <InfoItem label={labels.genus} value={species.genus} />

        <div>
          <dt className="text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-stone-400">
            {labels.genderRatio}
          </dt>
          <dd className="mt-1">
            {femalePercent === null ? (
              <span className="text-sm font-semibold text-stone-400">{labels.genderless}</span>
            ) : (
              <span className="flex flex-wrap gap-x-3 text-sm font-semibold">
                {malePercent !== null && malePercent > 0 && (
                  <span className="text-sky-500">♂ {formatPercent(malePercent)}%</span>
                )}
                {femalePercent > 0 && (
                  <span className="text-pink-500">♀ {formatPercent(femalePercent)}%</span>
                )}
              </span>
            )}
          </dd>
        </div>

        <div>
          <dt className="text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-stone-400">
            {labels.eggGroups}
          </dt>
          <dd className="mt-1 text-sm font-semibold text-stone-700">
            {species.eggGroups.map(formatEggGroupName).join(', ')}
          </dd>
        </div>

        <div>
          <dt className="text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-stone-400">
            {labels.captureRate}
          </dt>
          <dd className="mt-1 flex items-baseline gap-1.5">
            <span className="text-sm font-semibold text-stone-700">{species.captureRate}</span>
            <span className="text-xs text-stone-400">/ 255</span>
          </dd>
        </div>

        <div>
          <dt className="text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-stone-400">
            {labels.baseHappiness}
          </dt>
          <dd className="mt-1 flex items-baseline gap-1.5">
            <span className="text-sm font-semibold text-stone-700">{species.baseHappiness}</span>
            <span className="text-xs text-stone-400">/ 255</span>
          </dd>
        </div>
      </dl>
    </section>
  );
}
