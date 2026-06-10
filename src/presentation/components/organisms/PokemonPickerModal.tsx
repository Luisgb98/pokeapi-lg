'use client';

import { useState, useRef } from 'react';
import { Dialog } from 'radix-ui';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { TypeBadge } from '@/presentation/components/atoms/TypeBadge';
import { Spinner } from '@/presentation/components/atoms/Spinner';
import { useTeamBuilderStore, TEAM_MAX_SIZE } from '@/presentation/store/teamBuilderStore';
import type { TeamMember } from '@/presentation/store/teamBuilderStore';
import { usePokemonInfiniteList } from '@/presentation/queries/pokemonQueries';
import { useDebounce } from '@/presentation/hooks/useDebounce';
import { cn } from '@/presentation/lib/utils';
import type { PokemonType } from '@/domain/entities/Pokemon';

interface PokemonPickerModalProps {
  open: boolean;
  onClose: () => void;
}

export function PokemonPickerModal({ open, onClose }: PokemonPickerModalProps) {
  const t = useTranslations('teamBuilder');
  const tTypes = useTranslations('types');

  const { team, addMember } = useTeamBuilderStore();
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedSearch = useDebounce(search, 300);

  const isFull = team.length >= TEAM_MAX_SIZE;
  const hasSearch = debouncedSearch.length >= 2;

  const { data, isLoading } = usePokemonInfiniteList(hasSearch ? { search: debouncedSearch } : {});
  const results = hasSearch ? (data?.pages[0]?.items ?? []) : [];

  function handleClose() {
    setSearch('');
    onClose();
  }

  function handleAdd(p: {
    id: number;
    name: string;
    displayName: string;
    types: readonly PokemonType[];
    sprite: string;
  }) {
    const member: TeamMember = {
      id: p.id,
      name: p.name,
      displayName: p.displayName,
      types: p.types,
      sprite: p.sprite,
    };
    addMember(member);
    if (team.length + 1 >= TEAM_MAX_SIZE) handleClose();
  }

  return (
    <Dialog.Root open={open} onOpenChange={(v: boolean) => !v && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity data-[state=closed]:opacity-0 data-[state=open]:opacity-100" />

        <Dialog.Content
          onOpenAutoFocus={(e: Event) => {
            e.preventDefault();
            inputRef.current?.focus();
          }}
          className={cn(
            'fixed inset-0 z-50 flex flex-col bg-white dark:bg-stone-900',
            'sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-full sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2',
            'sm:max-h-[min(600px,85dvh)] sm:rounded-2xl sm:border sm:border-stone-200 sm:shadow-2xl dark:sm:border-stone-700',
          )}
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-stone-100 px-5 py-4 dark:border-stone-800">
            <Dialog.Title className="font-display text-base font-black text-stone-900 dark:text-stone-50">
              {t('pickerTitle')}
            </Dialog.Title>
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close"
              className="flex size-7 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800 dark:hover:text-stone-300"
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

          {/* Search input */}
          <div className="shrink-0 px-5 py-3">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                />
              </svg>
              <input
                ref={inputRef}
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className={cn(
                  'w-full rounded-xl border border-stone-200 bg-stone-50 py-2.5 pl-9 pr-4 text-sm text-stone-900 outline-none transition-colors placeholder:text-stone-400',
                  'focus:border-stone-400 focus:bg-white focus:ring-2 focus:ring-stone-200',
                  'dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:placeholder:text-stone-500 dark:focus:border-stone-500 dark:focus:bg-stone-800 dark:focus:ring-stone-700',
                )}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  aria-label={t('clearSearch')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  <svg
                    className="size-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="min-h-0 flex-1 overflow-y-auto pb-[env(safe-area-inset-bottom)]">
            {!hasSearch ? (
              <p className="px-5 py-8 text-center text-sm text-stone-400">{t('searchHint')}</p>
            ) : isLoading ? (
              <div className="flex justify-center py-10">
                <Spinner size="sm" />
              </div>
            ) : results.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-stone-400">{t('noResults')}</p>
            ) : (
              <ul className="divide-y divide-stone-100 pb-2 dark:divide-stone-800">
                {results.map((p) => {
                  const onTeam = team.some((m) => m.id === p.id);
                  return (
                    <li key={p.id} className="flex items-center gap-3 px-5 py-3">
                      <Image
                        src={p.sprite}
                        alt={p.displayName}
                        width={48}
                        height={48}
                        loading="lazy"
                        className="shrink-0 object-contain drop-shadow-sm"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-display text-sm font-bold text-stone-900 dark:text-stone-50">
                          {p.displayName}
                        </p>
                        <div className="mt-0.5 flex flex-wrap gap-0.5">
                          {p.types.map((tp) => (
                            <TypeBadge key={tp} type={tp} size="sm" label={tTypes(tp)} />
                          ))}
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={isFull || onTeam}
                        onClick={() => handleAdd(p)}
                        className={cn(
                          'shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
                          onTeam
                            ? 'cursor-default bg-stone-100 text-stone-400 dark:bg-stone-800 dark:text-stone-500'
                            : isFull
                              ? 'cursor-not-allowed bg-stone-100 text-stone-300 dark:bg-stone-800 dark:text-stone-600'
                              : 'bg-stone-900 text-white hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200',
                        )}
                      >
                        {onTeam ? t('alreadyOnTeam') : t('addToTeam')}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
