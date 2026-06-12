import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getDailySeed } from '@/application/usecases/getGameChallenge';
import type { GameChallenge } from '@/application/usecases/getGameChallenge';

export const TIMER_SECONDS = 30;
export const MAX_ROUNDS = 10;
export const HISTORY_LIMIT = 60;

type GamePhase = 'playing' | 'revealed';

interface GameState {
  dailySeed: number;
  phase: GamePhase;
  selectedId: number | null;
  score: { correct: number; total: number };
  challenge: GameChallenge | null;
  roundOffset: number;
  streak: number;
  bestScore: number;
  lastCompletedSeed: number | null;
  history: { seed: number; correct: number }[];
}

interface GameActions {
  initOrRestore: (initialChallenge: GameChallenge) => void;
  guess: (pokemonId: number) => void;
  timeOut: () => void;
  startNext: (challenge: GameChallenge) => void;
}

export type GameStore = GameState & GameActions;

const INITIAL_STATE: GameState = {
  dailySeed: 0,
  phase: 'playing',
  selectedId: null,
  score: { correct: 0, total: 0 },
  challenge: null,
  roundOffset: 0,
  streak: 0,
  bestScore: 0,
  lastCompletedSeed: null,
  history: [],
};

function completionUpdate(
  state: Pick<GameStore, 'dailySeed' | 'streak' | 'bestScore' | 'lastCompletedSeed' | 'history'>,
  correct: number,
): Partial<GameState> {
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

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      initOrRestore: (initialChallenge) => {
        const today = getDailySeed();
        const { dailySeed, challenge, streak, bestScore, lastCompletedSeed, history } = get();
        if (dailySeed === today && challenge !== null) return;
        set({
          ...INITIAL_STATE,
          dailySeed: today,
          challenge: initialChallenge,
          streak,
          bestScore,
          lastCompletedSeed,
          history,
        });
      },

      guess: (pokemonId) => {
        const { phase, challenge, score } = get();
        if (phase !== 'playing' || !challenge) return;
        const isCorrect = pokemonId === challenge.correct.id;
        const newCorrect = score.correct + (isCorrect ? 1 : 0);
        const newTotal = score.total + 1;
        const completion = newTotal === MAX_ROUNDS ? completionUpdate(get(), newCorrect) : {};
        set({
          phase: 'revealed',
          selectedId: pokemonId,
          score: { correct: newCorrect, total: newTotal },
          ...completion,
        });
      },

      timeOut: () => {
        const { phase, score } = get();
        if (phase !== 'playing') return;
        const newTotal = score.total + 1;
        const completion = newTotal === MAX_ROUNDS ? completionUpdate(get(), score.correct) : {};
        set({
          phase: 'revealed',
          selectedId: null,
          score: { ...score, total: newTotal },
          ...completion,
        });
      },

      startNext: (challenge) => {
        const { roundOffset } = get();
        set({ phase: 'playing', selectedId: null, challenge, roundOffset: roundOffset + 1 });
      },
    }),
    {
      name: 'pokemon-game-v2',
      skipHydration: true,
    },
  ),
);
