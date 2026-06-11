import { beforeEach, describe, expect, it } from 'vitest';
import type { GameChallenge } from '@/application/usecases/getGameChallenge';
import type { PokemonSummary } from '@/domain/entities/Pokemon';
import { useGameStore } from '@/presentation/store/gameStore';

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
};

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
