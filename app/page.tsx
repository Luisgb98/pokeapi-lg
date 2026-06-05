'use client';

import { FilterBar } from '@/components/organisms/FilterBar';
import { PokemonGrid } from '@/components/organisms/PokemonGrid';

export default function HomePage() {
  return (
    <div className="min-h-dvh">
      {/* Header */}
      <header className="mx-auto max-w-7xl px-4 pb-4 pt-8 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <h1
              className="text-3xl font-black tracking-tight text-stone-900 sm:text-4xl"
              style={{ fontFamily: 'var(--font-syne)' }}
            >
              Pokédex
            </h1>
            <p className="mt-1 text-sm text-stone-500">
              Explore, filter, and discover Pokémon across all generations
            </p>
          </div>
          <div className="hidden select-none text-4xl opacity-15 sm:block">◉</div>
        </div>
      </header>

      <FilterBar />
      <PokemonGrid />
    </div>
  );
}
