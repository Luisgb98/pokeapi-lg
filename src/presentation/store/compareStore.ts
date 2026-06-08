import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type CompareSlot = 'a' | 'b' | 'c';

interface CompareState {
  readonly slots: Record<CompareSlot, number | null>;
  readonly setSlot: (slot: CompareSlot, id: number) => void;
  readonly clearSlot: (slot: CompareSlot) => void;
  readonly clearAll: () => void;
}

const cookieStorage = {
  getItem: (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
  },
  setItem: (name: string, value: string): void => {
    if (typeof document === 'undefined') return;
    const maxAge = 60 * 60 * 24 * 365;
    document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAge}; path=/; SameSite=Lax`;
  },
  removeItem: (name: string): void => {
    if (typeof document === 'undefined') return;
    document.cookie = `${name}=; max-age=0; path=/`;
  },
};

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
