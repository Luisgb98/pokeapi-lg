import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getDailySeed } from '@/application/usecases/getGameChallenge';
import type { GameChallenge } from '@/application/usecases/getGameChallenge';

export const TIMER_SECONDS = 30;
export const MAX_ROUNDS = 10;

type GamePhase = 'playing' | 'revealed';

interface GameState {
  dailySeed: number;
  phase: GamePhase;
  selectedId: number | null;
  score: { correct: number; total: number };
  challenge: GameChallenge | null;
  roundOffset: number;
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
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      initOrRestore: (initialChallenge) => {
        const today = getDailySeed();
        const { dailySeed, challenge } = get();
        if (dailySeed === today && challenge !== null) return;
        set({ ...INITIAL_STATE, dailySeed: today, challenge: initialChallenge });
      },

      guess: (pokemonId) => {
        const { phase, challenge, score } = get();
        if (phase !== 'playing' || !challenge) return;
        const isCorrect = pokemonId === challenge.correct.id;
        set({
          phase: 'revealed',
          selectedId: pokemonId,
          score: {
            correct: score.correct + (isCorrect ? 1 : 0),
            total: score.total + 1,
          },
        });
      },

      timeOut: () => {
        const { phase, score } = get();
        if (phase !== 'playing') return;
        set({ phase: 'revealed', selectedId: null, score: { ...score, total: score.total + 1 } });
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
