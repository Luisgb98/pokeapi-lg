import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PokemonType } from '@/domain/entities/Pokemon';
import {
  useTypeQuizStore,
  MAX_QUIZ_ROUNDS,
  HISTORY_LIMIT,
} from '@/presentation/store/typeQuizStore';

const TODAY = 1000;

vi.mock('@/application/usecases/getGameChallenge', () => ({
  getDailySeed: vi.fn(() => TODAY),
}));

const MOCK_QUESTION = {
  defendingTypes: ['water'] as PokemonType[],
  choices: ['fire', 'grass', 'electric', 'normal'] as PokemonType[],
  correct: 'fire' as PokemonType,
};

vi.mock('@/domain/usecases/getTypeQuizQuestion', () => ({
  getTypeQuizQuestion: vi.fn(() => MOCK_QUESTION),
}));

const INITIAL_STATE = {
  dailySeed: 0,
  phase: 'playing' as const,
  selected: null,
  score: { correct: 0, total: 0 },
  round: 0,
  streak: 0,
  bestScore: 0,
  lastCompletedSeed: null,
  history: [],
};

function completeQuiz(correctGuesses: number): void {
  for (let i = 0; i < MAX_QUIZ_ROUNDS; i++) {
    if (i < correctGuesses) {
      useTypeQuizStore.getState().answer('fire');
    } else {
      useTypeQuizStore.getState().timeOut();
    }
    if (i < MAX_QUIZ_ROUNDS - 1) {
      useTypeQuizStore.getState().next();
    }
  }
}

beforeEach(() => {
  useTypeQuizStore.setState(INITIAL_STATE);
});

describe('answer', () => {
  it('correct answer increments score.correct, reveals, and records selection', () => {
    useTypeQuizStore.setState({ ...INITIAL_STATE, dailySeed: TODAY });
    useTypeQuizStore.getState().answer('fire');
    const { phase, score, selected } = useTypeQuizStore.getState();
    expect(phase).toBe('revealed');
    expect(score).toEqual({ correct: 1, total: 1 });
    expect(selected).toBe('fire');
  });

  it('wrong answer reveals without incrementing correct count', () => {
    useTypeQuizStore.setState({ ...INITIAL_STATE, dailySeed: TODAY });
    useTypeQuizStore.getState().answer('grass');
    const { phase, score } = useTypeQuizStore.getState();
    expect(phase).toBe('revealed');
    expect(score).toEqual({ correct: 0, total: 1 });
  });

  it('is a no-op when phase is already revealed', () => {
    useTypeQuizStore.setState({ ...INITIAL_STATE, dailySeed: TODAY, phase: 'revealed' });
    useTypeQuizStore.getState().answer('fire');
    expect(useTypeQuizStore.getState().score).toEqual({ correct: 0, total: 0 });
  });
});

describe('timeOut', () => {
  it('increments total but not correct, sets selected to null, reveals', () => {
    useTypeQuizStore.setState({ ...INITIAL_STATE, dailySeed: TODAY });
    useTypeQuizStore.getState().timeOut();
    const { phase, score, selected } = useTypeQuizStore.getState();
    expect(phase).toBe('revealed');
    expect(score).toEqual({ correct: 0, total: 1 });
    expect(selected).toBeNull();
  });

  it('is a no-op when phase is already revealed', () => {
    useTypeQuizStore.setState({ ...INITIAL_STATE, dailySeed: TODAY, phase: 'revealed' });
    useTypeQuizStore.getState().timeOut();
    expect(useTypeQuizStore.getState().score).toEqual({ correct: 0, total: 0 });
  });
});

describe('next', () => {
  it('resets phase to playing, clears selected, increments round', () => {
    useTypeQuizStore.setState({
      ...INITIAL_STATE,
      phase: 'revealed',
      round: 3,
      selected: 'fire' as PokemonType,
    });
    useTypeQuizStore.getState().next();
    const { phase, round, selected } = useTypeQuizStore.getState();
    expect(phase).toBe('playing');
    expect(round).toBe(4);
    expect(selected).toBeNull();
  });
});

describe('streak and history tracking', () => {
  it('completing 10 rounds sets streak=1, appends history, updates bestScore', () => {
    useTypeQuizStore.setState({ ...INITIAL_STATE, dailySeed: TODAY });
    completeQuiz(7);
    const { streak, bestScore, lastCompletedSeed, history } = useTypeQuizStore.getState();
    expect(streak).toBe(1);
    expect(bestScore).toBe(7);
    expect(lastCompletedSeed).toBe(TODAY);
    expect(history).toHaveLength(1);
    expect(history[0]).toEqual({ seed: TODAY, correct: 7 });
  });

  it('re-answering after completion does not double-count', () => {
    useTypeQuizStore.setState({
      ...INITIAL_STATE,
      dailySeed: TODAY,
      lastCompletedSeed: TODAY,
      streak: 5,
      bestScore: 9,
      history: [{ seed: TODAY, correct: 9 }],
      score: { correct: 9, total: 10 },
      phase: 'revealed',
    });
    useTypeQuizStore.getState().answer('fire');
    const { streak, bestScore, history } = useTypeQuizStore.getState();
    expect(streak).toBe(5);
    expect(bestScore).toBe(9);
    expect(history).toHaveLength(1);
  });

  it('initOrRestore on a new day resets play state but preserves streak/best/history', () => {
    const oldSeed = 500;
    useTypeQuizStore.setState({
      ...INITIAL_STATE,
      dailySeed: oldSeed,
      streak: 4,
      bestScore: 8,
      lastCompletedSeed: oldSeed,
      history: [{ seed: oldSeed, correct: 8 }],
      score: { correct: 6, total: 10 },
      phase: 'revealed',
      round: 9,
      selected: 'fire' as PokemonType,
    });
    useTypeQuizStore.getState().initOrRestore();
    const state = useTypeQuizStore.getState();
    expect(state.dailySeed).toBe(TODAY);
    expect(state.streak).toBe(4);
    expect(state.bestScore).toBe(8);
    expect(state.lastCompletedSeed).toBe(oldSeed);
    expect(state.history).toHaveLength(1);
    expect(state.score).toEqual({ correct: 0, total: 0 });
    expect(state.phase).toBe('playing');
    expect(state.round).toBe(0);
    expect(state.selected).toBeNull();
  });

  it('consecutive-day completion increments streak', () => {
    useTypeQuizStore.setState({
      ...INITIAL_STATE,
      dailySeed: TODAY,
      streak: 3,
      lastCompletedSeed: TODAY - 1,
    });
    completeQuiz(5);
    expect(useTypeQuizStore.getState().streak).toBe(4);
  });

  it('gapped-day completion resets streak to 1', () => {
    useTypeQuizStore.setState({
      ...INITIAL_STATE,
      dailySeed: TODAY,
      streak: 10,
      lastCompletedSeed: TODAY - 3,
    });
    completeQuiz(5);
    expect(useTypeQuizStore.getState().streak).toBe(1);
  });

  it('history is capped at HISTORY_LIMIT', () => {
    const existingHistory = Array.from({ length: HISTORY_LIMIT }, (_, i) => ({
      seed: i,
      correct: 5,
    }));
    useTypeQuizStore.setState({
      ...INITIAL_STATE,
      dailySeed: TODAY,
      history: existingHistory,
      lastCompletedSeed: TODAY - 1,
      streak: 1,
    });
    completeQuiz(5);
    expect(useTypeQuizStore.getState().history).toHaveLength(HISTORY_LIMIT);
    expect(useTypeQuizStore.getState().history[HISTORY_LIMIT - 1]).toEqual({
      seed: TODAY,
      correct: 5,
    });
  });
});
