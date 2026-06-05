import { create } from 'zustand';
import type { Generation, PokemonType } from '../../domain/entities/Pokemon';

interface PokemonUIState {
  search: string;
  type: PokemonType | undefined;
  generation: Generation | undefined;
  setSearch: (search: string) => void;
  setType: (type: PokemonType | undefined) => void;
  setGeneration: (generation: Generation | undefined) => void;
  reset: () => void;
}

export const usePokemonStore = create<PokemonUIState>((set) => ({
  search: '',
  type: undefined,
  generation: undefined,
  setSearch: (search) => set({ search }),
  setType: (type) => set({ type }),
  setGeneration: (generation) => set({ generation }),
  reset: () => set({ search: '', type: undefined, generation: undefined }),
}));
