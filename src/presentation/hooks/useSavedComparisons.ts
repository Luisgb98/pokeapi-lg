'use client';

import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listComparisonsAction,
  saveComparisonAction,
  deleteComparisonAction,
} from '@/application/actions/userData';
import type { SavedComparison } from '@/domain/entities/SavedComparison';
import type { NewComparisonInput } from '@/domain/ports/UserDataRepository';

const QUERY_KEY = ['user-saved-comparisons'] as const;

export interface SaveComparisonPayload extends NewComparisonInput {
  id?: string;
}

/**
 * Provides server-persisted named comparisons for authenticated users.
 *
 * Separate from the ephemeral compareStore (current session's slots).
 * Saved comparisons are named snapshots stored in the DB.
 *
 * Returns `{ savedComparisons: [], ... }` with mutations no-ops when logged out.
 */
export function useSavedComparisons() {
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user?.id;
  const queryClient = useQueryClient();

  const { data: savedComparisons = [], isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const result = await listComparisonsAction();
      if (!result.success) throw new Error(result.error);
      return result.data as SavedComparison[];
    },
    enabled: isAuthenticated,
    staleTime: 60_000,
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: SaveComparisonPayload) => {
      const result = await saveComparisonAction(payload);
      if (!result.success) throw new Error(result.error);
      return result.data as SavedComparison;
    },
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previous = queryClient.getQueryData<SavedComparison[]>(QUERY_KEY) ?? [];
      if (payload.id) {
        queryClient.setQueryData<SavedComparison[]>(
          QUERY_KEY,
          previous.map((c) =>
            c.id === payload.id
              ? {
                  ...c,
                  name: payload.name ?? c.name,
                  slotA: payload.slotA ?? c.slotA,
                  slotB: payload.slotB ?? c.slotB,
                  slotC: payload.slotC ?? c.slotC,
                }
              : c,
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
    mutationFn: async (comparisonId: string) => {
      const result = await deleteComparisonAction(comparisonId);
      if (!result.success) throw new Error(result.error);
    },
    onMutate: async (comparisonId) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previous = queryClient.getQueryData<SavedComparison[]>(QUERY_KEY) ?? [];
      queryClient.setQueryData<SavedComparison[]>(
        QUERY_KEY,
        previous.filter((c) => c.id !== comparisonId),
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
    savedComparisons,
    isLoading,
    isAuthenticated,
    saveComparison: (payload: SaveComparisonPayload) => saveMutation.mutate(payload),
    deleteComparison: (comparisonId: string) => deleteMutation.mutate(comparisonId),
    isSaving: saveMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
