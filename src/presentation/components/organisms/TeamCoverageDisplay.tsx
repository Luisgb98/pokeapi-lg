'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { TypeBadge } from '@/presentation/components/atoms/TypeBadge';
import { computeTeamCoverage } from '@/domain/entities/typeChart';
import type { TeamCoverageEntry } from '@/domain/entities/typeChart';
import type { PokemonType } from '@/domain/entities/Pokemon';

interface TeamCoverageDisplayProps {
  teamTypes: readonly (readonly PokemonType[])[];
  typeLabels: Record<PokemonType, string>;
  title: string;
}

function dangerScore(entry: TeamCoverageEntry): number {
  return entry.x4Count * 4 + entry.x2Count * 2;
}

function coverageScore(entry: TeamCoverageEntry): number {
  return entry.immuneCount * 3 + entry.quarterCount * 2 + entry.halfCount;
}

interface CoverageCellProps {
  entry: TeamCoverageEntry;
  typeLabels: Record<PokemonType, string>;
}

function CoverageCell({ entry, typeLabels }: CoverageCellProps) {
  const t = useTranslations('teamBuilder');
  const weakCount = entry.x4Count + entry.x2Count;
  const resistCount = entry.halfCount + entry.quarterCount;

  const borderColor =
    entry.x4Count > 0
      ? 'border-red-300 dark:border-red-900'
      : entry.x2Count >= 2
        ? 'border-orange-200 dark:border-orange-900'
        : weakCount > 0
          ? 'border-stone-200 dark:border-stone-700'
          : entry.immuneCount > 0 || resistCount >= 2
            ? 'border-sky-200 dark:border-sky-900'
            : 'border-stone-200 dark:border-stone-700';

  return (
    <div
      className={`flex flex-col gap-1.5 rounded-xl border bg-white p-3 shadow-sm dark:bg-stone-800 ${borderColor}`}
    >
      <TypeBadge type={entry.attackingType} size="sm" label={typeLabels[entry.attackingType]} />

      <div className="flex flex-wrap gap-1">
        {weakCount > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600 dark:bg-red-950 dark:text-red-400">
            <span className="size-2 rounded-full bg-red-400" aria-hidden="true" />
            {t('membersWeak', { count: weakCount })}
          </span>
        )}
        {resistCount > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-xs font-semibold text-sky-600 dark:bg-sky-950 dark:text-sky-400">
            <span className="size-2 rounded-full bg-sky-400" aria-hidden="true" />
            {t('membersResist', { count: resistCount })}
          </span>
        )}
        {entry.immuneCount > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2 py-0.5 text-xs font-semibold text-stone-500 dark:bg-stone-700 dark:text-stone-400">
            <span className="size-2 rounded-full bg-stone-400" aria-hidden="true" />
            {t('memberImmune', { count: entry.immuneCount })}
          </span>
        )}
      </div>
    </div>
  );
}

export function TeamCoverageDisplay({ teamTypes, typeLabels, title }: TeamCoverageDisplayProps) {
  const coverage = useMemo(() => computeTeamCoverage(teamTypes), [teamTypes]);

  const sorted = useMemo(
    () =>
      coverage.toSorted((a, b) => {
        const danger = dangerScore(b) - dangerScore(a);
        if (danger !== 0) return danger;
        return coverageScore(b) - coverageScore(a);
      }),
    [coverage],
  );

  return (
    <section className="rounded-2xl border border-stone-200 bg-stone-50 p-4 sm:p-6 dark:border-stone-700 dark:bg-stone-900">
      <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-[0.15em] text-stone-400 dark:text-stone-500">
        {title}
      </h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {sorted.map((entry) => (
          <CoverageCell key={entry.attackingType} entry={entry} typeLabels={typeLabels} />
        ))}
      </div>
    </section>
  );
}
