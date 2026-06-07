'use client';

import { SlidersHorizontal } from 'lucide-react';
import { SearchInput } from '@/presentation/components/molecules/SearchInput';
import { MultiSelect } from '@/presentation/components/molecules/MultiSelect';
import { usePokemonStore } from '@/presentation/store/pokemonStore';
import { POKEMON_TYPES } from '@/domain/entities/Pokemon';
import { GENERATION_OPTIONS } from '@/presentation/lib/generationLabels';
import { TYPE_CLASSES } from '@/presentation/lib/typeColors';
import { cn } from '@/presentation/lib/utils';
import type { PokemonType, Generation } from '@/domain/entities/Pokemon';

const TYPE_OPTIONS = POKEMON_TYPES.map((t) => ({
  value: t,
  label: t.charAt(0).toUpperCase() + t.slice(1),
}));

export function FilterBar() {
  const {
    search,
    types,
    generations,
    typeMatchMode,
    setSearch,
    setTypes,
    setGenerations,
    setTypeMatchMode,
  } = usePokemonStore();

  const hasActiveFilters = types.length > 0 || generations.length > 0 || search.length === 1;

  const typeMatchToggle = (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-stone-400">Match:</span>
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
          Any
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
          All
        </button>
      </span>
    </div>
  );

  return (
    <div className="sticky top-0 z-20 border-b border-stone-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <SearchInput value={search} onChange={setSearch} className="flex-1" />

          <div className="flex shrink-0 items-center gap-2">
            <SlidersHorizontal className="size-4 shrink-0 text-stone-400" />

            <MultiSelect
              values={types}
              onChange={(v) => setTypes(v as PokemonType[])}
              options={TYPE_OPTIONS}
              placeholder="All types"
              className="w-36"
              headerSlot={typeMatchToggle}
            />

            <MultiSelect
              values={generations}
              onChange={(v) => setGenerations(v as Generation[])}
              options={GENERATION_OPTIONS}
              placeholder="All gens"
              className="w-36"
            />
          </div>
        </div>

        {hasActiveFilters && (
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
            {types.length > 0 && (
              <>
                <span className="text-xs text-stone-500">
                  {types.length === 1 ? 'Type:' : 'Types:'}
                </span>
                {types.length <= 3 ? (
                  types.map((t) => (
                    <span
                      key={t}
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${TYPE_CLASSES[t].badgeBg} ${TYPE_CLASSES[t].badgeText} ${TYPE_CLASSES[t].badgeBorder}`}
                    >
                      {t}
                    </span>
                  ))
                ) : (
                  <span className="inline-flex items-center rounded-full border border-stone-200 bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600">
                    {types.length} types
                  </span>
                )}
              </>
            )}

            {generations.length > 0 && (
              <>
                <span className="text-xs text-stone-500">
                  {generations.length === 1 ? 'Gen:' : 'Gens:'}
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
                    {generations.length} gens
                  </span>
                )}
              </>
            )}

            {search.length === 1 && (
              <span className="text-xs text-amber-600">Type 1 more character to search</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
