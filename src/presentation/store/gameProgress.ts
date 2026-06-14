export const HISTORY_LIMIT = 60;

export interface CompletionState {
  dailySeed: number;
  streak: number;
  bestScore: number;
  lastCompletedSeed: number | null;
  history: { seed: number; correct: number }[];
}

export function completionUpdate(
  state: CompletionState,
  correct: number,
): Partial<CompletionState> {
  const alreadyCounted = state.lastCompletedSeed === state.dailySeed;
  if (alreadyCounted) return {};
  const continued = state.lastCompletedSeed === state.dailySeed - 1;
  return {
    streak: continued ? state.streak + 1 : 1,
    bestScore: Math.max(state.bestScore, correct),
    lastCompletedSeed: state.dailySeed,
    history: [...state.history, { seed: state.dailySeed, correct }].slice(-HISTORY_LIMIT),
  };
}
