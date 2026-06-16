import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { z } from 'zod';
import { withValidation } from '@/presentation/lib/validatedStorage';

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
    {
      name: 'pokemon-favorites',
      storage: createJSONStorage(() =>
        withValidation(
          {
            getItem: (n) => (typeof window === 'undefined' ? null : window.localStorage.getItem(n)),
            setItem: (n, v) => {
              if (typeof window !== 'undefined') window.localStorage.setItem(n, v);
            },
            removeItem: (n) => {
              if (typeof window !== 'undefined') window.localStorage.removeItem(n);
            },
          },
          z.object({ ids: z.array(z.number().int().positive()) }),
        ),
      ),
    },
  ),
);
