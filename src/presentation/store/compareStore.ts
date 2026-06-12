import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { z } from 'zod';
import { cookieStorage } from '@/presentation/lib/cookieStorage';
import { withValidation } from '@/presentation/lib/validatedStorage';

export type CompareSlot = 'a' | 'b' | 'c';

interface CompareState {
  readonly slots: Record<CompareSlot, number | null>;
  readonly setSlot: (slot: CompareSlot, id: number) => void;
  readonly clearSlot: (slot: CompareSlot) => void;
  readonly clearAll: () => void;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set) => ({
      slots: { a: null, b: null, c: null },
      setSlot: (slot, id) => set((state) => ({ slots: { ...state.slots, [slot]: id } })),
      clearSlot: (slot) => set((state) => ({ slots: { ...state.slots, [slot]: null } })),
      clearAll: () => set({ slots: { a: null, b: null, c: null } }),
    }),
    {
      name: 'pokemon-compare',
      storage: createJSONStorage(() =>
        withValidation(
          cookieStorage,
          z.object({
            slots: z.object({
              a: z.number().int().positive().nullable(),
              b: z.number().int().positive().nullable(),
              c: z.number().int().positive().nullable(),
            }),
          }),
        ),
      ),
    },
  ),
);
