import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { cookieStorage } from '@/presentation/lib/cookieStorage';

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
      storage: createJSONStorage(() => cookieStorage),
    },
  ),
);
