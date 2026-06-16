import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { z } from 'zod';
import { getDailySeed } from '@/application/usecases/getGameChallenge';
import { getTypeQuizQuestion } from '@/domain/usecases/getTypeQuizQuestion';
import type { PokemonType } from '@/domain/entities/Pokemon';
import { TIMER_SECONDS } from './gameStore';
import { completionUpdate, HISTORY_LIMIT } from './gameProgress';
import { withValidation } from '@/presentation/lib/validatedStorage';

export { TIMER_SECONDS, HISTORY_LIMIT };
export const MAX_QUIZ_ROUNDS = 10;

type QuizPhase = 'playing' | 'revealed';

interface TypeQuizState {
  dailySeed: number;
  phase: QuizPhase;
  selected: PokemonType | null;
  score: { correct: number; total: number };
  round: number;
  streak: number;
  bestScore: number;
  lastCompletedSeed: number | null;
  history: { seed: number; correct: number }[];
}

interface TypeQuizActions {
  initOrRestore: () => void;
  answer: (type: PokemonType) => void;
  timeOut: () => void;
  next: () => void;
}

export type TypeQuizStore = TypeQuizState & TypeQuizActions;

const INITIAL_STATE: TypeQuizState = {
  dailySeed: 0,
  phase: 'playing',
  selected: null,
  score: { correct: 0, total: 0 },
  round: 0,
  streak: 0,
  bestScore: 0,
  lastCompletedSeed: null,
  history: [],
};

const stateSchema = z.object({
  dailySeed: z.number().int(),
  phase: z.enum(['playing', 'revealed']),
  selected: z.string().nullable(),
  score: z.object({ correct: z.number().int(), total: z.number().int() }),
  round: z.number().int().nonnegative(),
  streak: z.number().int().nonnegative(),
  bestScore: z.number().int().nonnegative(),
  lastCompletedSeed: z.number().int().nullable(),
  history: z.array(z.object({ seed: z.number().int(), correct: z.number().int() })),
});

export const useTypeQuizStore = create<TypeQuizStore>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      initOrRestore: () => {
        const today = getDailySeed();
        const { dailySeed, streak, bestScore, lastCompletedSeed, history } = get();
        if (dailySeed === today) return;
        set({
          ...INITIAL_STATE,
          dailySeed: today,
          streak,
          bestScore,
          lastCompletedSeed,
          history,
        });
      },

      answer: (type) => {
        const { phase, dailySeed, round, score } = get();
        if (phase !== 'playing') return;
        const question = getTypeQuizQuestion(dailySeed, round);
        const isCorrect = type === question.correct;
        const newCorrect = score.correct + (isCorrect ? 1 : 0);
        const newTotal = score.total + 1;
        const completion = newTotal === MAX_QUIZ_ROUNDS ? completionUpdate(get(), newCorrect) : {};
        set({
          phase: 'revealed',
          selected: type,
          score: { correct: newCorrect, total: newTotal },
          ...completion,
        });
      },

      timeOut: () => {
        const { phase, score } = get();
        if (phase !== 'playing') return;
        const newTotal = score.total + 1;
        const completion =
          newTotal === MAX_QUIZ_ROUNDS ? completionUpdate(get(), score.correct) : {};
        set({
          phase: 'revealed',
          selected: null,
          score: { ...score, total: newTotal },
          ...completion,
        });
      },

      next: () => {
        const { round } = get();
        set({ phase: 'playing', selected: null, round: round + 1 });
      },
    }),
    {
      name: 'pokemon-typequiz-v1',
      skipHydration: true,
      storage: createJSONStorage(() =>
        withValidation(
          {
            getItem: (n) => (typeof window === 'undefined' ? null : window.localStorage.getItem(n)),
            setItem: (n, v) => {
              if (typeof window !== 'undefined') window.localStorage.setItem(n, v);
            },
            removeItem: (n) => {
              if (typeof window !== 'undefined') window.localStorage.removeItem(n);
            },
          },
          stateSchema,
        ),
      ),
    },
  ),
);
