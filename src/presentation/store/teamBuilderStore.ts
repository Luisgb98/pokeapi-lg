import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { PokemonType } from '@/domain/entities/Pokemon';

export const TEAM_MAX_SIZE = 6;

export interface TeamMember {
  readonly id: number;
  readonly name: string;
  readonly displayName: string;
  readonly types: readonly PokemonType[];
  readonly sprite: string;
}

interface TeamBuilderState {
  readonly team: readonly TeamMember[];
  readonly addMember: (member: TeamMember) => void;
  readonly removeMember: (id: number) => void;
  readonly reorderTeam: (from: number, to: number) => void;
  readonly clear: () => void;
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

export const useTeamBuilderStore = create<TeamBuilderState>()(
  persist(
    (set, get) => ({
      team: [],
      addMember: (member: TeamMember) => {
        const { team } = get();
        if (team.length >= TEAM_MAX_SIZE) return;
        if (team.some((m) => m.id === member.id)) return;
        set({ team: [...team, member] });
      },
      removeMember: (id: number) => {
        set((state) => ({ team: state.team.filter((m) => m.id !== id) }));
      },
      reorderTeam: (from: number, to: number) => {
        const { team } = get();
        const next = [...team];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        set({ team: next });
      },
      clear: () => set({ team: [] }),
    }),
    {
      name: 'pokemon-team',
      storage: createJSONStorage(() => cookieStorage),
    },
  ),
);
