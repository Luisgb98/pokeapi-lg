'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useQueryClient } from '@tanstack/react-query';
import { useFavoritesStore } from '@/presentation/store/favoritesStore';
import { useTeamBuilderStore } from '@/presentation/store/teamBuilderStore';
import { useCompareStore } from '@/presentation/store/compareStore';
import {
  toggleFavoriteAction,
  saveTeamAction,
  saveComparisonAction,
} from '@/application/actions/userData';

const IMPORT_FLAG = 'pokemon-import-v1';

export interface LocalSnapshot {
  favoriteCount: number;
  teamCount: number;
  hasComparison: boolean;
}

export interface LocalImportState {
  shouldPrompt: boolean;
  snapshot: LocalSnapshot;
  isImporting: boolean;
  importData: () => Promise<void>;
  dismiss: () => void;
}

function isDismissed(): boolean {
  if (typeof window === 'undefined') return true;
  return !!localStorage.getItem(IMPORT_FLAG);
}

function markDismissed(): void {
  if (typeof window !== 'undefined') localStorage.setItem(IMPORT_FLAG, '1');
}

export function useLocalImport(): LocalImportState {
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';

  const favoriteIds = useFavoritesStore((s) => s.ids);
  const team = useTeamBuilderStore((s) => s.team);
  const slots = useCompareStore((s) => s.slots);

  const [dismissed, setDismissed] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const queryClient = useQueryClient();

  // Check localStorage only after hydration (avoids SSR mismatch)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: one-shot post-hydration read
    setDismissed(isDismissed());
  }, []);

  const hasComparison = slots.a !== null || slots.b !== null || slots.c !== null;
  const snapshot: LocalSnapshot = {
    favoriteCount: favoriteIds.length,
    teamCount: team.length,
    hasComparison,
  };
  const hasAnyData = snapshot.favoriteCount > 0 || snapshot.teamCount > 0 || hasComparison;

  const shouldPrompt = isAuthenticated && !dismissed && hasAnyData;

  const dismiss = useCallback(() => {
    markDismissed();
    setDismissed(true);
  }, []);

  const importData = useCallback(async () => {
    setIsImporting(true);
    try {
      const tasks: Promise<unknown>[] = [];

      // Favorites — toggle each in parallel (server starts empty on first import)
      for (const id of favoriteIds) {
        tasks.push(toggleFavoriteAction(id));
      }

      // Team — save as a named snapshot
      if (team.length > 0) {
        tasks.push(
          saveTeamAction({
            name: 'My Team',
            members: team.map((m, i) => ({ slot: i, pokemonId: m.id })),
          }),
        );
      }

      // Comparison — save if any slot is set
      if (hasComparison) {
        tasks.push(
          saveComparisonAction({
            name: 'My Comparison',
            slotA: slots.a,
            slotB: slots.b,
            slotC: slots.c,
          }),
        );
      }

      await Promise.allSettled(tasks);

      // Invalidate so hooks re-fetch the freshly imported data
      queryClient.invalidateQueries({ queryKey: ['user-favorites'] });
      queryClient.invalidateQueries({ queryKey: ['user-saved-teams'] });
      queryClient.invalidateQueries({ queryKey: ['user-saved-comparisons'] });

      markDismissed();
      setDismissed(true);
    } finally {
      setIsImporting(false);
    }
  }, [favoriteIds, team, hasComparison, slots, queryClient]);

  return { shouldPrompt, snapshot, isImporting, importData, dismiss };
}
