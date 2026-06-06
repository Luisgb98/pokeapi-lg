import { create } from 'zustand';
import type { Generation, PokemonType } from '@/domain/entities/Pokemon';

interface PokemonUIState {
  search: string;
  type: PokemonType | undefined;
  generation: Generation | undefined;
  /** Saved scroll position before navigating to a detail page. */
  scrollY: number;
  setSearch: (search: string) => void;
  setType: (type: PokemonType | undefined) => void;
  setGeneration: (generation: Generation | undefined) => void;
  setScrollY: (y: number) => void;
  reset: () => void;
}

export const usePokemonStore = create<PokemonUIState>((set) => ({
  search: '',
  type: undefined,
  generation: undefined,
  scrollY: 0,
  // Reset scrollY when filters change — different list = different scroll context.
  setSearch: (search) => set({ search, scrollY: 0 }),
  setType: (type) => set({ type, scrollY: 0 }),
  setGeneration: (generation) => set({ generation, scrollY: 0 }),
  setScrollY: (scrollY) => set({ scrollY }),
  reset: () => set({ search: '', type: undefined, generation: undefined, scrollY: 0 }),
}));
