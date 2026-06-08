import { create } from 'zustand';
import type { Generation, PokemonType } from '@/domain/entities/Pokemon';
import type { TypeMatchMode } from '@/domain/ports/PokemonRepository';

interface PokemonUIState {
  search: string;
  types: PokemonType[];
  generations: Generation[];
  typeMatchMode: TypeMatchMode;
  showFavoritesOnly: boolean;
  /** Saved scroll position before navigating to a detail page. */
  scrollY: number;
  /** Number of Pokémon loaded when we last navigated away — skips re-animating cached cards on back navigation. */
  restoreCount: number;
  setSearch: (search: string) => void;
  setTypes: (types: PokemonType[]) => void;
  setGenerations: (generations: Generation[]) => void;
  setTypeMatchMode: (mode: TypeMatchMode) => void;
  setShowFavoritesOnly: (value: boolean) => void;
  /** Save scroll position and loaded-card count atomically before navigating to a detail page. */
  setNavState: (scrollY: number, restoreCount: number) => void;
  reset: () => void;
}

export const usePokemonStore = create<PokemonUIState>((set) => ({
  search: '',
  types: [],
  generations: [],
  typeMatchMode: 'any',
  showFavoritesOnly: false,
  scrollY: 0,
  restoreCount: 0,
  setSearch: (search) => set({ search, scrollY: 0, restoreCount: 0 }),
  setTypes: (types) => set({ types, scrollY: 0, restoreCount: 0 }),
  setGenerations: (generations) => set({ generations, scrollY: 0, restoreCount: 0 }),
  setTypeMatchMode: (typeMatchMode) => set({ typeMatchMode, scrollY: 0, restoreCount: 0 }),
  setShowFavoritesOnly: (showFavoritesOnly) =>
    set({ showFavoritesOnly, scrollY: 0, restoreCount: 0 }),
  setNavState: (scrollY, restoreCount) => set({ scrollY, restoreCount }),
  reset: () =>
    set({
      search: '',
      types: [],
      generations: [],
      typeMatchMode: 'any',
      showFavoritesOnly: false,
      scrollY: 0,
      restoreCount: 0,
    }),
}));
