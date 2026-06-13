'use client';

import { useMemo } from 'react';
import { TypeBadge } from '@/presentation/components/atoms/TypeBadge';
import { computeOffensiveCoverage } from '@/domain/entities/typeChart';
import type { OffensiveCoverageEntry } from '@/domain/entities/typeChart';
import type { PokemonType } from '@/domain/entities/Pokemon';

interface OffensiveCoverageDisplayProps {
  teamTypes: readonly (readonly PokemonType[])[];
  typeLabels: Record<PokemonType, string>;
  title: string;
  /** e.g. "Based on STAB types only" */
  subtitle: string;
  /** e.g. "Not covered super-effectively:" */
  gapsLabel: string;
  /** e.g. "Your team covers every type" */
  noGapsLabel: string;
}

function multiplierLabel(m: number): string {
  if (m === 0) return '×0';
  if (m === 0.5) return '×½';
  if (m === 2) return '×2';
  if (m === 4) return '×4';
  return '×1';
}

function multiplierClasses(m: number): string {
  if (m >= 2) return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400';
  if (m === 0.5) return 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400';
  if (m === 0) return 'bg-stone-100 text-stone-500 dark:bg-stone-700 dark:text-stone-400';
  return 'bg-stone-50 text-stone-500 dark:bg-stone-800 dark:text-stone-400';
}

interface OffensiveCellProps {
  entry: OffensiveCoverageEntry;
  typeLabels: Record<PokemonType, string>;
}

function OffensiveCell({ entry, typeLabels }: OffensiveCellProps) {
  const borderClass =
    entry.bestMultiplier >= 2
      ? 'border-emerald-200 dark:border-emerald-900'
      : 'border-stone-200 dark:border-stone-700';

  return (
    <div
      className={`flex flex-col gap-1.5 rounded-xl border bg-white p-3 shadow-sm dark:bg-stone-800 ${borderClass}`}
    >
      <TypeBadge type={entry.defendingType} size="sm" label={typeLabels[entry.defendingType]} />
      <span
        className={`inline-flex items-center self-start rounded-full px-2 py-0.5 text-xs font-semibold ${multiplierClasses(entry.bestMultiplier)}`}
      >
        {multiplierLabel(entry.bestMultiplier)}
        {entry.superEffectiveCount > 0 && (
          <span className="ml-1 opacity-70">({entry.superEffectiveCount})</span>
        )}
      </span>
    </div>
  );
}

export function OffensiveCoverageDisplay({
  teamTypes,
  typeLabels,
  title,
  subtitle,
  gapsLabel,
  noGapsLabel,
}: OffensiveCoverageDisplayProps) {
  const coverage = useMemo(() => computeOffensiveCoverage(teamTypes), [teamTypes]);

  const gaps = useMemo(() => coverage.filter((e) => e.bestMultiplier < 2), [coverage]);

  const sorted = useMemo(
    () =>
      coverage.toSorted((a, b) => {
        if (b.bestMultiplier !== a.bestMultiplier) return b.bestMultiplier - a.bestMultiplier;
        return b.superEffectiveCount - a.superEffectiveCount;
      }),
    [coverage],
  );

  return (
    <section className="rounded-2xl border border-stone-200 bg-stone-50 p-4 sm:p-6 dark:border-stone-700 dark:bg-stone-900">
      <h2 className="mb-1 font-display text-sm font-bold uppercase tracking-[0.15em] text-stone-400 dark:text-stone-500">
        {title}
      </h2>
      <p className="mb-4 text-xs text-stone-400 dark:text-stone-500">{subtitle}</p>

      {/* Gaps row */}
      <div className="mb-4">
        <p className="mb-2 text-xs font-semibold text-stone-500 dark:text-stone-400">{gapsLabel}</p>
        {gaps.length === 0 ? (
          <p className="text-xs text-emerald-600 dark:text-emerald-400">{noGapsLabel}</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {gaps.map((e) => (
              <TypeBadge
                key={e.defendingType}
                type={e.defendingType}
                size="sm"
                label={typeLabels[e.defendingType]}
              />
            ))}
          </div>
        )}
      </div>

      {/* Full grid */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {sorted.map((entry) => (
          <OffensiveCell key={entry.defendingType} entry={entry} typeLabels={typeLabels} />
        ))}
      </div>
    </section>
  );
}
