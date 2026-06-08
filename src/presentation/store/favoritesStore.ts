import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoritesState {
  ids: number[];
  toggle: (id: number) => void;
  isFavorite: (id: number) => boolean;
  count: () => number;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) =>
        set((s) =>
          s.ids.includes(id) ? { ids: s.ids.filter((x) => x !== id) } : { ids: [...s.ids, id] },
        ),
      isFavorite: (id) => get().ids.includes(id),
      count: () => get().ids.length,
    }),
    { name: 'pokemon-favorites' },
  ),
);
