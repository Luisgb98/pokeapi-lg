import { TypeBadge } from '@/presentation/components/atoms/TypeBadge';
import { computeDefensiveMatchups } from '@/domain/entities/typeChart';
import type { DefensiveMatchups } from '@/domain/entities/typeChart';
import type { PokemonType } from '@/domain/entities/Pokemon';

interface TypeMatchupTableLabels {
  title: string;
  weaknesses: string;
  resistances: string;
  weakX4: string;
  weakX2: string;
  resistHalf: string;
  resistQuarter: string;
  immune: string;
}

interface TypeMatchupTableProps {
  types: readonly PokemonType[];
  typeLabels: Record<PokemonType, string>;
  labels: TypeMatchupTableLabels;
}

interface RowConfig {
  key: keyof DefensiveMatchups;
  symbol: string;
  symbolBg: string;
  symbolText: string;
  label: string;
}

interface MatchupRowProps {
  config: RowConfig;
  types: readonly PokemonType[];
  typeLabels: Record<PokemonType, string>;
}

function MatchupRow({ config, types, typeLabels }: MatchupRowProps) {
  if (types.length === 0) return null;
  return (
    <div className="flex items-start gap-3 py-2.5">
      <div
        aria-label={config.label}
        className={`flex h-8 w-11 shrink-0 items-center justify-center rounded-lg text-xs font-black shadow-sm ${config.symbolBg} ${config.symbolText}`}
      >
        {config.symbol}
      </div>
      <div className="flex flex-wrap gap-1.5 pt-0.5">
        {types.map((type) => (
          <TypeBadge key={type} type={type} size="sm" label={typeLabels[type]} />
        ))}
      </div>
    </div>
  );
}

export function TypeMatchupTable({ types, typeLabels, labels }: TypeMatchupTableProps) {
  const matchups = computeDefensiveMatchups(types);

  const weaknessConfigs: RowConfig[] = [
    {
      key: 'x4',
      symbol: '×4',
      symbolBg: 'bg-red-500',
      symbolText: 'text-white',
      label: labels.weakX4,
    },
    {
      key: 'x2',
      symbol: '×2',
      symbolBg: 'bg-orange-400',
      symbolText: 'text-white',
      label: labels.weakX2,
    },
  ];

  const resistanceConfigs: RowConfig[] = [
    {
      key: 'half',
      symbol: '0.5',
      symbolBg: 'bg-sky-400',
      symbolText: 'text-white',
      label: labels.resistHalf,
    },
    {
      key: 'quarter',
      symbol: '0.25',
      symbolBg: 'bg-indigo-500',
      symbolText: 'text-white',
      label: labels.resistQuarter,
    },
    {
      key: 'immune',
      symbol: '×0',
      symbolBg: 'bg-stone-100',
      symbolText: 'text-stone-500',
      label: labels.immune,
    },
  ];

  const visibleWeaknesses = weaknessConfigs.filter((c) => matchups[c.key].length > 0);
  const visibleResistances = resistanceConfigs.filter((c) => matchups[c.key].length > 0);

  if (visibleWeaknesses.length === 0 && visibleResistances.length === 0) return null;

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <h2 className="mb-5 font-display text-sm font-bold uppercase tracking-[0.15em] text-stone-400">
        {labels.title}
      </h2>

      <div className="divide-y divide-stone-100">
        {visibleWeaknesses.length > 0 && (
          <div className="pb-3">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-red-400">
              {labels.weaknesses}
            </p>
            {visibleWeaknesses.map((config) => (
              <MatchupRow
                key={config.key}
                config={config}
                types={matchups[config.key]}
                typeLabels={typeLabels}
              />
            ))}
          </div>
        )}
        {visibleResistances.length > 0 && (
          <div className={visibleWeaknesses.length > 0 ? 'pt-3' : ''}>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-sky-400">
              {labels.resistances}
            </p>
            {visibleResistances.map((config) => (
              <MatchupRow
                key={config.key}
                config={config}
                types={matchups[config.key]}
                typeLabels={typeLabels}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
