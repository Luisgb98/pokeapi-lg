'use client';

import { Dialog } from 'radix-ui';
import { useLocale, useTranslations } from 'next-intl';
import { usePokemonForBuild, useMoveLearnset } from '@/presentation/queries/teamBuildQueries';
import { cn } from '@/presentation/lib/utils';
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
    <Dialog.Root open onOpenChange={(v: boolean) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-stone-900/40 backdrop-blur-sm transition-opacity data-[state=closed]:opacity-0 data-[state=open]:opacity-100" />

        <Dialog.Content
          aria-describedby={undefined}
          className={cn(
            'fixed inset-x-0 bottom-0 z-50 flex max-h-[90dvh] flex-col rounded-t-2xl bg-white shadow-2xl ring-1 ring-stone-900/10 dark:bg-stone-950 dark:ring-stone-50/10',
            'sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-full sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-h-[85dvh] sm:rounded-2xl',
          )}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-stone-100 bg-white/95 px-5 py-4 backdrop-blur-sm dark:border-stone-800 dark:bg-stone-950/95">
            <div>
              <Dialog.Title className="font-display text-base font-bold text-stone-900 dark:text-stone-100">
                {t('configure')}
              </Dialog.Title>
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

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5">
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
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
