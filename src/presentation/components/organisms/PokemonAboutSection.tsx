import type { Ability } from '@/domain/entities/Ability';
import { formatHeight, formatWeight } from '@/domain/entities/Pokemon';

interface AboutLabels {
  section: string;
  height: string;
  weight: string;
  abilities: string;
  hidden: string;
}

interface Props {
  height: number;
  weight: number;
  abilities: readonly Ability[];
  labels: AboutLabels;
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

export function PokemonAboutSection({ height, weight, abilities, labels }: Props) {
  return (
    <section className="min-w-0 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-700 dark:bg-stone-900">
      <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-[0.15em] text-stone-400">
        {labels.section}
      </h2>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-5">
        <InfoItem label={labels.height} value={formatHeight(height)} />
        <InfoItem label={labels.weight} value={formatWeight(weight)} />

        {abilities.length > 0 && (
          <div className="col-span-2">
            <dt className="text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-stone-400">
              {labels.abilities}
            </dt>
            <dd className="mt-1 space-y-2">
              {abilities.map((ability) => (
                <div key={ability.name}>
                  <span className="text-sm font-semibold text-stone-700 dark:text-stone-200">
                    {ability.displayName}
                    {ability.isHidden && (
                      <span className="ml-1.5 text-xs font-normal text-stone-400">
                        ({labels.hidden})
                      </span>
                    )}
                  </span>
                  {ability.effect && (
                    <p className="mt-0.5 text-xs text-stone-400">{ability.effect}</p>
                  )}
                </div>
              ))}
            </dd>
          </div>
        )}
      </dl>
    </section>
  );
}
