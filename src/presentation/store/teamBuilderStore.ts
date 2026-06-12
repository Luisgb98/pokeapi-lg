import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { z } from 'zod';
import type { PokemonType } from '@/domain/entities/Pokemon';
import { cookieStorage } from '@/presentation/lib/cookieStorage';
import { withValidation } from '@/presentation/lib/validatedStorage';

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
  /** Adds members in order, skipping duplicates, stopping at TEAM_MAX_SIZE. */
  readonly addMembers: (members: TeamMember[]) => void;
  readonly removeMember: (id: number) => void;
  readonly reorderTeam: (from: number, to: number) => void;
  readonly clear: () => void;
}

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
      addMembers: (members: TeamMember[]) => {
        const { team } = get();
        const next = [...team];
        for (const member of members) {
          if (next.length >= TEAM_MAX_SIZE) break;
          if (next.some((m) => m.id === member.id)) continue;
          next.push(member);
        }
        if (next.length !== team.length) set({ team: next });
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
      storage: createJSONStorage(() =>
        withValidation(
          cookieStorage,
          z.object({
            team: z
              .array(
                z.object({
                  id: z.number().int().positive(),
                  name: z.string(),
                  displayName: z.string(),
                  types: z.array(z.string()),
                  sprite: z.string(),
                }),
              )
              .max(TEAM_MAX_SIZE),
          }),
        ),
      ),
    },
  ),
);
