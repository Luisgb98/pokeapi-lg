'use client';

import { useState, useRef } from 'react';
import { Dialog } from 'radix-ui';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { X } from 'lucide-react';
import { TypeBadge } from '@/presentation/components/atoms/TypeBadge';
import { Spinner } from '@/presentation/components/atoms/Spinner';
import { useDebounce } from '@/presentation/hooks/useDebounce';
import { usePokemonInfiniteList } from '@/presentation/queries/pokemonQueries';
import { cn } from '@/presentation/lib/utils';
import type { Pokemon, PokemonType } from '@/domain/entities/Pokemon';

interface ComparisonPickerProps {
  label: string;
  borderColor: string;
  pokemon: Pokemon | null;
  isLoading: boolean;
  onSelect: (id: number) => void;
  onClear: () => void;
}

export function ComparisonPicker({
  label,
  borderColor,
  pokemon,
  isLoading,
  onSelect,
  onClear,
}: ComparisonPickerProps) {
  const t = useTranslations('compare');
  const tTypes = useTranslations('types');
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedSearch = useDebounce(search, 300);

  const hasSearch = debouncedSearch.length >= 2;
  const { data, isLoading: isSearching } = usePokemonInfiniteList(
    hasSearch ? { search: debouncedSearch } : {},
  );
  const results = hasSearch ? (data?.pages[0]?.items ?? []) : [];

  function handleClose() {
    setSearch('');
    setOpen(false);
  }

  function handleSelect(id: number) {
    onSelect(id);
    handleClose();
  }

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center rounded-2xl border border-stone-200 bg-stone-50">
        <Spinner size="sm" />
      </div>
    );
  }

  if (pokemon) {
    return (
      <div
        className="relative flex flex-col items-center gap-2 rounded-2xl border-2 bg-white px-3 pb-4 pt-3 shadow-sm"
        style={{ borderColor }}
      >
        <button
          type="button"
          onClick={onClear}
          aria-label={t('clear')}
          className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
        >
          <X className="size-3.5" />
        </button>
        <div className="relative size-20">
          <Image
            src={pokemon.artwork}
            alt={pokemon.displayName}
            fill
            sizes="80px"
            className="object-contain drop-shadow-sm"
          />
        </div>
        <p className="text-center font-display text-sm font-bold text-stone-900">
          {pokemon.displayName}
        </p>
        <div className="flex flex-wrap justify-center gap-1">
          {pokemon.types.map((type) => (
            <TypeBadge key={type} type={type} size="sm" label={tTypes(type)} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-40 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50 text-stone-400 transition-colors hover:border-stone-300 hover:bg-white hover:text-stone-600"
      >
        <span className="text-2xl font-light leading-none">+</span>
        <span className="text-xs font-medium">{label}</span>
      </button>

      <Dialog.Root open={open} onOpenChange={(v) => !v && handleClose()}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" />
          <Dialog.Content
            onOpenAutoFocus={(e) => {
              e.preventDefault();
              inputRef.current?.focus();
            }}
            className={cn(
              'fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2',
              'flex max-h-[min(600px,85dvh)] flex-col rounded-2xl border border-stone-200 bg-white shadow-2xl',
            )}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-stone-100 px-5 py-4">
              <Dialog.Title className="font-display text-base font-black text-stone-900">
                {t('add')}
              </Dialog.Title>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close"
                className="flex size-7 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>

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
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2.5 pl-9 pr-4 text-sm text-stone-900 outline-none transition-colors placeholder:text-stone-400 focus:border-stone-400 focus:bg-white focus:ring-2 focus:ring-stone-200"
                />
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              {!hasSearch ? (
                <p className="px-5 py-8 text-center text-sm text-stone-400">{t('searchHint')}</p>
              ) : isSearching ? (
                <div className="flex justify-center py-10">
                  <Spinner size="sm" />
                </div>
              ) : results.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-stone-400">{t('noResults')}</p>
              ) : (
                <ul className="divide-y divide-stone-100 pb-2">
                  {results.map((p) => (
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
                        <p className="truncate font-display text-sm font-bold text-stone-900">
                          {p.displayName}
                        </p>
                        <div className="mt-0.5 flex flex-wrap gap-0.5">
                          {p.types.map((tp: PokemonType) => (
                            <TypeBadge key={tp} type={tp} size="sm" label={tTypes(tp)} />
                          ))}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSelect(p.id)}
                        className="shrink-0 rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-stone-700"
                      >
                        {t('select')}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
