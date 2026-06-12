import { beforeEach, describe, expect, it } from 'vitest';
import type { GameChallenge } from '@/application/usecases/getGameChallenge';
import type { PokemonSummary } from '@/domain/entities/Pokemon';
import { useGameStore, MAX_ROUNDS, HISTORY_LIMIT } from '@/presentation/store/gameStore';

const makeSummary = (id: number): PokemonSummary => ({
  id,
  name: `pokemon-${id}`,
  displayName: `Pokemon ${id}`,
  types: ['normal'],
  sprite: `https://sprites.pokemon.com/${id}.png`,
  generation: 'generation-i',
});

const makeChallenge = (correctId: number): GameChallenge => ({
  correct: makeSummary(correctId),
  choices: [correctId, correctId + 1, correctId + 2, correctId + 3].map(makeSummary),
  seed: 1000,
});

const INITIAL = {
  dailySeed: 0,
  phase: 'playing' as const,
  selectedId: null,
  score: { correct: 0, total: 0 },
  challenge: null,
  roundOffset: 0,
  streak: 0,
  bestScore: 0,
  lastCompletedSeed: null,
  history: [],
};

/** Drive the store to completion (MAX_ROUNDS rounds), returning correct count. */
function completeGame(correctGuesses: number): void {
  for (let i = 0; i < MAX_ROUNDS; i++) {
    const { challenge } = useGameStore.getState();
    if (!challenge) throw new Error('No challenge set');
    if (i < correctGuesses) {
      useGameStore.getState().guess(challenge.correct.id);
    } else {
      useGameStore.getState().timeOut();
    }
    if (i < MAX_ROUNDS - 1) {
      useGameStore.getState().startNext(makeChallenge(100 + i));
    }
  }
}

beforeEach(() => {
  useGameStore.setState(INITIAL);
});

describe('initial state', () => {
  it('starts with score 0/0', () => {
    expect(useGameStore.getState().score).toEqual({ correct: 0, total: 0 });
  });

  it('starts in playing phase', () => {
    expect(useGameStore.getState().phase).toBe('playing');
  });

  it('has no challenge until initOrRestore is called', () => {
    expect(useGameStore.getState().challenge).toBeNull();
  });
});

describe('initOrRestore', () => {
  it('sets challenge on first call (dailySeed 0 never matches real date)', () => {
    const challenge = makeChallenge(25);
    useGameStore.getState().initOrRestore(challenge);
    expect(useGameStore.getState().challenge).toEqual(challenge);
  });

  it('does not overwrite state when today seed and challenge are already present', () => {
    const challenge1 = makeChallenge(25);
    useGameStore.getState().initOrRestore(challenge1);
    const todaySeed = useGameStore.getState().dailySeed;
    useGameStore.setState({ dailySeed: todaySeed, challenge: challenge1 });
    useGameStore.getState().initOrRestore(makeChallenge(1));
    expect(useGameStore.getState().challenge).toEqual(challenge1);
  });
});

describe('guess', () => {
  it('records a correct guess and sets phase to revealed', () => {
    useGameStore.setState({ ...INITIAL, challenge: makeChallenge(25) });
    useGameStore.getState().guess(25);
    const { phase, score, selectedId } = useGameStore.getState();
    expect(phase).toBe('revealed');
    expect(score).toEqual({ correct: 1, total: 1 });
    expect(selectedId).toBe(25);
  });

  it('records an incorrect guess without incrementing correct count', () => {
    useGameStore.setState({ ...INITIAL, challenge: makeChallenge(25) });
    useGameStore.getState().guess(1);
    expect(useGameStore.getState().score).toEqual({ correct: 0, total: 1 });
  });

  it('is a no-op when phase is already revealed', () => {
    useGameStore.setState({ ...INITIAL, challenge: makeChallenge(25), phase: 'revealed' });
    useGameStore.getState().guess(25);
    expect(useGameStore.getState().score).toEqual({ correct: 0, total: 0 });
  });
});

describe('timeOut', () => {
  it('increments total score, leaves correct unchanged, sets selectedId to null', () => {
    useGameStore.setState({ ...INITIAL, challenge: makeChallenge(25) });
    useGameStore.getState().timeOut();
    const { phase, score, selectedId } = useGameStore.getState();
    expect(phase).toBe('revealed');
    expect(score).toEqual({ correct: 0, total: 1 });
    expect(selectedId).toBeNull();
  });

  it('is a no-op when phase is already revealed', () => {
    useGameStore.setState({ ...INITIAL, challenge: makeChallenge(25), phase: 'revealed' });
    useGameStore.getState().timeOut();
    expect(useGameStore.getState().score).toEqual({ correct: 0, total: 0 });
  });
});

describe('startNext', () => {
  it('loads new challenge, resets to playing phase, and increments roundOffset', () => {
    useGameStore.setState({ ...INITIAL, phase: 'revealed', roundOffset: 2 });
    const next = makeChallenge(26);
    useGameStore.getState().startNext(next);
    const { phase, challenge, roundOffset, selectedId } = useGameStore.getState();
    expect(phase).toBe('playing');
    expect(challenge).toEqual(next);
    expect(roundOffset).toBe(3);
    expect(selectedId).toBeNull();
  });
});

describe('streak and history tracking', () => {
  it('case 1: completing a challenge sets streak=1, appends history, updates bestScore', () => {
    const seed = 500;
    useGameStore.setState({ ...INITIAL, dailySeed: seed, challenge: makeChallenge(1) });
    completeGame(7);
    const { streak, lastCompletedSeed, history, bestScore } = useGameStore.getState();
    expect(streak).toBe(1);
    expect(lastCompletedSeed).toBe(seed);
    expect(history).toHaveLength(1);
    expect(history[0]).toEqual({ seed, correct: 7 });
    expect(bestScore).toBe(7);
  });

  it('case 2: completing on the next consecutive day increments streak', () => {
    const seed = 500;
    useGameStore.setState({
      ...INITIAL,
      dailySeed: seed,
      challenge: makeChallenge(1),
      streak: 3,
      lastCompletedSeed: seed - 1,
      bestScore: 5,
      history: [{ seed: seed - 1, correct: 5 }],
    });
    completeGame(6);
    expect(useGameStore.getState().streak).toBe(4);
  });

  it('case 3: completing after a gap resets streak to 1', () => {
    const seed = 500;
    useGameStore.setState({
      ...INITIAL,
      dailySeed: seed,
      challenge: makeChallenge(1),
      streak: 10,
      lastCompletedSeed: seed - 3,
      bestScore: 8,
      history: [],
    });
    completeGame(5);
    expect(useGameStore.getState().streak).toBe(1);
  });

  it('case 4: same-day re-completion does not double-count', () => {
    const seed = 500;
    useGameStore.setState({
      ...INITIAL,
      dailySeed: seed,
      challenge: makeChallenge(1),
      lastCompletedSeed: seed,
      streak: 5,
      bestScore: 9,
      history: [{ seed, correct: 9 }],
    });
    completeGame(3);
    const { streak, bestScore, history } = useGameStore.getState();
    expect(streak).toBe(5);
    expect(bestScore).toBe(9);
    expect(history).toHaveLength(1);
  });

  it('case 5: bestScore only increases (lower completion score leaves it unchanged)', () => {
    const seed = 500;
    useGameStore.setState({
      ...INITIAL,
      dailySeed: seed,
      challenge: makeChallenge(1),
      bestScore: 8,
      lastCompletedSeed: seed - 1,
      streak: 1,
      history: [],
    });
    completeGame(3);
    expect(useGameStore.getState().bestScore).toBe(8);
  });

  it('case 6: history is capped at HISTORY_LIMIT', () => {
    const existingHistory = Array.from({ length: HISTORY_LIMIT }, (_, i) => ({
      seed: i,
      correct: 5,
    }));
    const seed = HISTORY_LIMIT;
    useGameStore.setState({
      ...INITIAL,
      dailySeed: seed,
      challenge: makeChallenge(1),
      history: existingHistory,
      lastCompletedSeed: seed - 1,
      streak: 1,
    });
    completeGame(5);
    expect(useGameStore.getState().history).toHaveLength(HISTORY_LIMIT);
    expect(useGameStore.getState().history[HISTORY_LIMIT - 1]).toEqual({ seed, correct: 5 });
  });

  it('case 7: initOrRestore on a new day preserves streak/bestScore/history and resets gameplay state', () => {
    const oldSeed = 400;
    useGameStore.setState({
      ...INITIAL,
      dailySeed: oldSeed,
      challenge: makeChallenge(1),
      streak: 4,
      bestScore: 8,
      lastCompletedSeed: oldSeed,
      history: [{ seed: oldSeed, correct: 8 }],
      score: { correct: 6, total: 10 },
      phase: 'revealed',
      roundOffset: 9,
    });
    const newChallenge = makeChallenge(99);
    useGameStore.getState().initOrRestore(newChallenge);
    const state = useGameStore.getState();
    expect(state.streak).toBe(4);
    expect(state.bestScore).toBe(8);
    expect(state.lastCompletedSeed).toBe(oldSeed);
    expect(state.history).toHaveLength(1);
    expect(state.score).toEqual({ correct: 0, total: 0 });
    expect(state.phase).toBe('playing');
    expect(state.roundOffset).toBe(0);
    expect(state.challenge).toEqual(newChallenge);
  });
});
