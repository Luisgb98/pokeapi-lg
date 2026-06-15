'use client';

import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useFavoritesStore } from '@/presentation/store/favoritesStore';
import { getFavoritesAction, toggleFavoriteAction } from '@/application/actions/userData';

const QUERY_KEY = ['user-favorites'] as const;

/**
 * Drop-in replacement for useFavoritesStore that adds server sync when
 * the user is authenticated.
 *
 * - Logged out:  delegates entirely to the local Zustand store (localStorage).
 * - Logged in:   reads from the server (via TanStack Query); writes call the
 *   server action with optimistic update + rollback on failure.
 *
 * The local store is never modified when authenticated — it remains the
 * guest-mode source of truth and will still hold the pre-sign-in data for
 * the Phase 5 import flow.
 */
export function useFavoritesSync() {
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user?.id;
  const store = useFavoritesStore();
  const queryClient = useQueryClient();

  const { data: serverIds = [], isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const result = await getFavoritesAction();
      if (!result.success) throw new Error(result.error);
      return result.data as number[];
    },
    enabled: isAuthenticated,
    staleTime: 30_000,
  });

  const mutation = useMutation({
    mutationFn: async (pokemonId: number) => {
      const result = await toggleFavoriteAction(pokemonId);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onMutate: async (pokemonId) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previous = queryClient.getQueryData<number[]>(QUERY_KEY) ?? [];
      const next = previous.includes(pokemonId)
        ? previous.filter((id) => id !== pokemonId)
        : [...previous, pokemonId];
      queryClient.setQueryData(QUERY_KEY, next);
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

  if (!isAuthenticated) {
    return {
      ids: store.ids,
      toggle: store.toggle,
      isFavorite: store.isFavorite,
      count: store.count,
      isLoading: false,
      isServerSynced: false,
    };
  }

  const ids = serverIds;
  return {
    ids,
    toggle: (id: number) => mutation.mutate(id),
    isFavorite: (id: number) => ids.includes(id),
    count: () => ids.length,
    isLoading,
    isServerSynced: true,
  };
}
