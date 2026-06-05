'use client';

import { SlidersHorizontal, X } from 'lucide-react';
import { SearchInput } from '@/presentation/components/molecules/SearchInput';
import { FilterSelect } from '@/presentation/components/molecules/FilterSelect';
import { Button } from '@/presentation/components/ui/button';
import { usePokemonStore } from '@/presentation/store/pokemonStore';
import { POKEMON_TYPES } from '@/domain/entities/Pokemon';
import { GENERATION_OPTIONS } from '@/presentation/lib/generationLabels';
import { TYPE_CLASSES } from '@/presentation/lib/typeColors';
import type { PokemonType } from '@/domain/entities/Pokemon';

const TYPE_OPTIONS = POKEMON_TYPES.map((t) => ({
  value: t,
  label: `${t.charAt(0).toUpperCase() + t.slice(1)}`,
}));

export function FilterBar() {
  const { search, type, generation, setSearch, setType, setGeneration, reset } = usePokemonStore();
  const hasFilters = search || type || generation;

  return (
    <div className="sticky top-0 z-20 border-b border-stone-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <SearchInput value={search} onChange={setSearch} className="flex-1" />

          <div className="flex shrink-0 items-center gap-2">
            <SlidersHorizontal className="size-4 shrink-0 text-stone-400" />

            <FilterSelect
              value={type}
              onChange={(v) => setType(v as PokemonType | undefined)}
              options={TYPE_OPTIONS}
              placeholder="All types"
              className="w-36"
            />

            <FilterSelect
              value={generation}
              onChange={(v) => setGeneration(v as typeof generation)}
              options={GENERATION_OPTIONS}
              placeholder="All gens"
              className="w-32"
            />

            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={reset}
                className="h-10 gap-1.5 rounded-xl text-stone-500 hover:text-stone-900"
              >
                <X className="size-3.5" />
                <span className="hidden sm:inline">Clear</span>
              </Button>
            )}
          </div>
        </div>

        {type && (
          <div className="mt-2 flex items-center gap-1.5">
            <span className="text-xs text-stone-500">Filtering by type:</span>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${TYPE_CLASSES[type].badgeBg} ${TYPE_CLASSES[type].badgeText} ${TYPE_CLASSES[type].badgeBorder}`}
            >
              {type}
              <button
                onClick={() => setType(undefined)}
                className="ml-0.5 opacity-60 hover:opacity-100"
              >
                ×
              </button>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
