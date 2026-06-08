'use client';

import { useTranslations } from 'next-intl';
import { Heart, SlidersHorizontal } from 'lucide-react';
import { SearchInput } from '@/presentation/components/molecules/SearchInput';
import { MultiSelect } from '@/presentation/components/molecules/MultiSelect';
import { TypeBadge } from '@/presentation/components/atoms/TypeBadge';
import { useHydration } from '@/presentation/hooks/useHydration';
import { usePokemonStore } from '@/presentation/store/pokemonStore';
import { useFavoritesStore } from '@/presentation/store/favoritesStore';
import { POKEMON_TYPES } from '@/domain/entities/Pokemon';
import { GENERATION_OPTIONS } from '@/presentation/lib/generationLabels';
import { cn } from '@/presentation/lib/utils';
import type { PokemonType, Generation } from '@/domain/entities/Pokemon';

export function FilterBar() {
  const t = useTranslations('filter');
  const tTypes = useTranslations('types');
  const tFav = useTranslations('favorites');
  const hydrated = useHydration();
  const {
    search,
    types,
    generations,
    typeMatchMode,
    showFavoritesOnly,
    setSearch,
    setTypes,
    setGenerations,
    setTypeMatchMode,
    setShowFavoritesOnly,
  } = usePokemonStore();
  const favCount = useFavoritesStore((s) => s.count());

  const TYPE_OPTIONS = POKEMON_TYPES.map((type) => ({
    value: type,
    label: tTypes(type),
  }));

  const hasActiveFilters =
    types.length > 0 || generations.length > 0 || search.length === 1 || showFavoritesOnly;

  const typeMatchToggle = (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-stone-400">{t('matchLabel')}</span>
      <span className="flex items-center gap-0.5 rounded-md border border-stone-200 bg-stone-50 p-0.5">
        <button
          type="button"
          onClick={() => setTypeMatchMode('any')}
          className={cn(
            'rounded px-2 py-0.5 text-xs font-medium transition-colors',
            typeMatchMode === 'any'
              ? 'bg-white text-stone-800 shadow-sm'
              : 'text-stone-400 hover:text-stone-600',
          )}
        >
          {t('matchAny')}
        </button>
        <button
          type="button"
          onClick={() => setTypeMatchMode('all')}
          className={cn(
            'rounded px-2 py-0.5 text-xs font-medium transition-colors',
            typeMatchMode === 'all'
              ? 'bg-white text-stone-800 shadow-sm'
              : 'text-stone-400 hover:text-stone-600',
          )}
        >
          {t('matchAll')}
        </button>
      </span>
    </div>
  );

  return (
    <div className="sticky top-0 z-20 border-b border-stone-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder={t('searchPlaceholder')}
            clearLabel={t('clearSearch')}
            className="flex-1"
          />

          {/* Filter controls */}
          <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
            <SlidersHorizontal className="size-4 shrink-0 text-stone-400" />

            <MultiSelect
              values={types}
              onChange={(v) => setTypes(v as PokemonType[])}
              options={TYPE_OPTIONS}
              placeholder={t('allTypes')}
              className="w-32 sm:w-36"
              headerSlot={typeMatchToggle}
            />

            <MultiSelect
              values={generations}
              onChange={(v) => setGenerations(v as Generation[])}
              options={GENERATION_OPTIONS}
              placeholder={t('allGens')}
              className="w-32 sm:w-36"
            />

            {hydrated && (
              <button
                type="button"
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                aria-pressed={showFavoritesOnly}
                aria-label={tFav('filterLabel')}
                className={cn(
                  'flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors',
                  showFavoritesOnly
                    ? 'border-rose-200 bg-rose-50 text-rose-600'
                    : 'border-stone-200 text-stone-500 hover:border-stone-300 hover:text-stone-700',
                )}
              >
                <Heart
                  className={cn(
                    'size-3.5',
                    showFavoritesOnly ? 'fill-rose-500 stroke-rose-500' : '',
                  )}
                />
                {favCount > 0 && <span>{favCount}</span>}
              </button>
            )}
          </div>
        </div>

        {hasActiveFilters && (
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
            {types.length > 0 && (
              <>
                <span className="text-xs text-stone-500">
                  {types.length === 1 ? t('typeLabel') : t('typesLabel')}
                </span>
                {types.length <= 3 ? (
                  types.map((type) => (
                    <TypeBadge key={type} type={type} size="sm" label={tTypes(type)} />
                  ))
                ) : (
                  <span className="inline-flex items-center rounded-full border border-stone-200 bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600">
                    {t('typesCount', { count: types.length })}
                  </span>
                )}
              </>
            )}

            {generations.length > 0 && (
              <>
                <span className="text-xs text-stone-500">
                  {generations.length === 1 ? t('genLabel') : t('gensLabel')}
                </span>
                {generations.length <= 3 ? (
                  generations.map((g) => {
                    const label = GENERATION_OPTIONS.find((o) => o.value === g)?.label ?? g;
                    return (
                      <span
                        key={g}
                        className="inline-flex items-center rounded-full border border-stone-200 bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600"
                      >
                        {label}
                      </span>
                    );
                  })
                ) : (
                  <span className="inline-flex items-center rounded-full border border-stone-200 bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600">
                    {t('gensCount', { count: generations.length })}
                  </span>
                )}
              </>
            )}

            {search.length === 1 && (
              <span className="text-xs text-amber-600">{t('typeMoreChar')}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
