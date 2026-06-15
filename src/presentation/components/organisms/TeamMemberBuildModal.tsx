'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePokemonForBuild, useMoveLearnset } from '@/presentation/queries/teamBuildQueries';
import { TeamMemberBuildEditor } from './TeamMemberBuildEditor';
import type { TeamMember } from '@/presentation/store/teamBuilderStore';
import type { TeamMemberBuild } from '@/domain/entities/TeamMemberBuild';

interface TeamMemberBuildModalProps {
  member: TeamMember;
  onSave: (build: TeamMemberBuild) => void;
  onClose: () => void;
}

export function TeamMemberBuildModal({ member, onSave, onClose }: TeamMemberBuildModalProps) {
  const t = useTranslations('teamBuild');
  const locale = useLocale();

  const pokemonQuery = usePokemonForBuild(member.id);
  const learnsetQuery = useMoveLearnset(member.id, locale);

  const isLoading = pokemonQuery.isLoading || learnsetQuery.isLoading;
  const pokemon = pokemonQuery.data;
  const learnedMoves = learnsetQuery.data ?? [];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('configure')}
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
    >
      <div
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white shadow-2xl ring-1 ring-stone-900/10 sm:rounded-2xl dark:bg-stone-950 dark:ring-stone-50/10">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-stone-100 bg-white/95 px-5 py-4 backdrop-blur-sm dark:border-stone-800 dark:bg-stone-950/95">
          <div>
            <h2 className="font-display text-base font-bold text-stone-900 dark:text-stone-100">
              {t('configure')}
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">{member.displayName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-8 items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800 dark:hover:text-stone-300"
          >
            <svg
              className="size-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5">
          {isLoading && (
            <div className="py-12 text-center text-sm text-stone-400 dark:text-stone-500">
              {t('loadingMoves')}
            </div>
          )}

          {!isLoading && pokemon && (
            <TeamMemberBuildEditor
              pokemonId={member.id}
              displayName={member.displayName}
              baseStats={pokemon.stats}
              abilities={pokemon.abilities}
              learnedMoves={learnedMoves}
              initialBuild={member.build}
              onSave={onSave}
              onClose={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}
