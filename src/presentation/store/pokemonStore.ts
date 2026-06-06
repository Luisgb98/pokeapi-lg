import { create } from 'zustand';
import type { Generation, PokemonType } from '@/domain/entities/Pokemon';

interface PokemonUIState {
  search: string;
  type: PokemonType | undefined;
  generation: Generation | undefined;
  /** Saved scroll position before navigating to a detail page. */
  scrollY: number;
  /** Number of Pokémon loaded when we last navigated away — skips re-animating cached cards on back navigation. */
  restoreCount: number;
  setSearch: (search: string) => void;
  setType: (type: PokemonType | undefined) => void;
  setGeneration: (generation: Generation | undefined) => void;
  /** Save scroll position and loaded-card count atomically before navigating to a detail page. */
  setNavState: (scrollY: number, restoreCount: number) => void;
  reset: () => void;
}

export const usePokemonStore = create<PokemonUIState>((set) => ({
  search: '',
  type: undefined,
  generation: undefined,
  scrollY: 0,
  restoreCount: 0,
  // Reset scroll state when filters change — different list = different scroll context.
  setSearch: (search) => set({ search, scrollY: 0, restoreCount: 0 }),
  setType: (type) => set({ type, scrollY: 0, restoreCount: 0 }),
  setGeneration: (generation) => set({ generation, scrollY: 0, restoreCount: 0 }),
  setNavState: (scrollY, restoreCount) => set({ scrollY, restoreCount }),
  reset: () =>
    set({ search: '', type: undefined, generation: undefined, scrollY: 0, restoreCount: 0 }),
}));
