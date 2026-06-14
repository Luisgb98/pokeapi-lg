'use client';

import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listTeamsAction, saveTeamAction, deleteTeamAction } from '@/application/actions/userData';
import type { SavedTeam } from '@/domain/entities/SavedTeam';
import type { NewTeamInput } from '@/domain/ports/UserDataRepository';

const QUERY_KEY = ['user-saved-teams'] as const;

export interface SaveTeamPayload extends NewTeamInput {
  id?: string;
}

/**
 * Provides server-persisted named teams for authenticated users.
 *
 * Note: this is separate from the ephemeral teamBuilderStore (the current
 * session's work-in-progress team). Saved teams are named snapshots that
 * persist across sessions and devices.
 *
 * Returns `{ savedTeams: [], ... }` with all mutations no-ops when logged out.
 */
export function useSavedTeams() {
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user?.id;
  const queryClient = useQueryClient();

  const { data: savedTeams = [], isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const result = await listTeamsAction();
      if (!result.success) throw new Error(result.error);
      return result.data as SavedTeam[];
    },
    enabled: isAuthenticated,
    staleTime: 60_000,
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: SaveTeamPayload) => {
      const result = await saveTeamAction(payload);
      if (!result.success) throw new Error(result.error);
      return result.data as SavedTeam;
    },
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previous = queryClient.getQueryData<SavedTeam[]>(QUERY_KEY) ?? [];
      if (payload.id) {
        queryClient.setQueryData<SavedTeam[]>(
          QUERY_KEY,
          previous.map((t) =>
            t.id === payload.id
              ? { ...t, name: payload.name, members: [...payload.members], updatedAt: new Date() }
              : t,
          ),
        );
      }
      return { previous };
    },
    onError: (_err, _payload, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(QUERY_KEY, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (teamId: string) => {
      const result = await deleteTeamAction(teamId);
      if (!result.success) throw new Error(result.error);
    },
    onMutate: async (teamId) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previous = queryClient.getQueryData<SavedTeam[]>(QUERY_KEY) ?? [];
      queryClient.setQueryData<SavedTeam[]>(
        QUERY_KEY,
        previous.filter((t) => t.id !== teamId),
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(QUERY_KEY, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  return {
    savedTeams,
    isLoading,
    isAuthenticated,
    saveTeam: (payload: SaveTeamPayload) => saveMutation.mutate(payload),
    deleteTeam: (teamId: string) => deleteMutation.mutate(teamId),
    isSaving: saveMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
