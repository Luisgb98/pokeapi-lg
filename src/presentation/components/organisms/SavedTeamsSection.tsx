'use client';

import { useTranslations } from 'next-intl';
import { useSession, signIn } from 'next-auth/react';
import { useSavedTeams } from '@/presentation/hooks/useSavedTeams';
import { useTeamBuilderStore } from '@/presentation/store/teamBuilderStore';

export function SavedTeamsSection() {
  const t = useTranslations('account');
  const { status } = useSession();
  const { savedTeams, isLoading, deleteTeam, isDeleting } = useSavedTeams();
  const clearTeam = useTeamBuilderStore((s) => s.clear);
  const addMembers = useTeamBuilderStore((s) => s.addMembers);

  if (status === 'unauthenticated') {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center dark:border-stone-700 dark:bg-stone-900">
        <p className="font-display text-lg font-semibold text-stone-900 dark:text-stone-100">
          {t('signInPrompt')}
        </p>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{t('signInDetail')}</p>
        <button
          type="button"
          onClick={() => void signIn('github')}
          className="mt-4 rounded-xl bg-stone-900 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-stone-700 dark:bg-white dark:text-stone-900 dark:hover:bg-stone-200"
        >
          {t('signInButton')}
        </button>
      </div>
    );
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-2xl bg-stone-100 dark:bg-stone-800" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100">
        {t('title')}
      </h1>
      <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{t('subtitle')}</p>

      {savedTeams.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-stone-300 p-8 text-center dark:border-stone-700">
          <p className="text-sm text-stone-400">{t('empty')}</p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {savedTeams.map((team) => (
            <li
              key={team.id}
              className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white px-5 py-4 dark:border-stone-700 dark:bg-stone-900"
            >
              <div className="flex-1 min-w-0">
                <p className="truncate font-semibold text-stone-900 dark:text-stone-100">
                  {team.name}
                </p>
                <p className="mt-0.5 text-xs text-stone-400">
                  {t('members', { count: team.members.length })}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    clearTeam();
                    addMembers(
                      team.members.map((m) => ({
                        id: m.pokemonId,
                        name: `#${m.pokemonId}`,
                        displayName: `#${m.pokemonId}`,
                        types: [],
                        sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${m.pokemonId}.png`,
                      })),
                    );
                  }}
                  className="rounded-xl border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-50 dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-800"
                >
                  {t('load')}
                </button>
                <button
                  type="button"
                  onClick={() => deleteTeam(team.id)}
                  disabled={isDeleting}
                  className="rounded-xl border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:hover:bg-red-950"
                >
                  {t('delete')}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
