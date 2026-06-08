'use client';

import Image from 'next/image';
import { useReducer, useEffect, useTransition } from 'react';
import type { CSSProperties } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/presentation/lib/utils';
import type { GameChallenge } from '@/application/usecases/getGameChallenge';
import type { PokemonSummary } from '@/domain/entities/Pokemon';
import { getOfficialArtworkUrl } from '@/domain/entities/Pokemon';
import { fetchNextChallenge } from '@/application/actions/game';

const TIMER_SECONDS = 30;

type GamePhase = 'playing' | 'revealed';

interface GameState {
  phase: GamePhase;
  selectedId: number | null;
  timeLeft: number;
  score: { correct: number; total: number };
  challenge: GameChallenge;
  roundOffset: number;
}

type GameAction =
  | { type: 'GUESS'; pokemonId: number }
  | { type: 'TICK' }
  | { type: 'START_NEXT'; challenge: GameChallenge };

function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'GUESS': {
      if (state.phase !== 'playing') return state;
      const isCorrect = action.pokemonId === state.challenge.correct.id;
      return {
        ...state,
        phase: 'revealed',
        selectedId: action.pokemonId,
        score: {
          correct: state.score.correct + (isCorrect ? 1 : 0),
          total: state.score.total + 1,
        },
      };
    }
    case 'TICK': {
      if (state.phase !== 'playing') return state;
      if (state.timeLeft <= 1) {
        return {
          ...state,
          phase: 'revealed',
          selectedId: null,
          score: { ...state.score, total: state.score.total + 1 },
        };
      }
      return { ...state, timeLeft: state.timeLeft - 1 };
    }
    case 'START_NEXT': {
      return {
        ...state,
        phase: 'playing',
        selectedId: null,
        timeLeft: TIMER_SECONDS,
        challenge: action.challenge,
        roundOffset: state.roundOffset + 1,
      };
    }
    default:
      return state;
  }
}

interface Props {
  initialChallenge: GameChallenge;
}

export function WhosThatPokemon({ initialChallenge }: Props) {
  const t = useTranslations('game');
  const [isPending, startTransition] = useTransition();

  const [state, dispatch] = useReducer(reducer, {
    phase: 'playing',
    selectedId: null,
    timeLeft: TIMER_SECONDS,
    score: { correct: 0, total: 0 },
    challenge: initialChallenge,
    roundOffset: 0,
  });

  const { phase, selectedId, timeLeft, score, challenge } = state;
  const isRevealed = phase === 'revealed';
  const timedOut = isRevealed && selectedId === null;
  const isCorrectGuess = isRevealed && selectedId === challenge.correct.id;

  useEffect(() => {
    if (phase !== 'playing') return;
    const id = setInterval(() => dispatch({ type: 'TICK' }), 1000);
    return () => clearInterval(id);
  }, [phase]);

  const handleGuess = (pokemonId: number) => {
    if (isRevealed) return;
    dispatch({ type: 'GUESS', pokemonId });
  };

  const handleNextRound = () => {
    startTransition(async () => {
      const next = await fetchNextChallenge(state.roundOffset + 1);
      dispatch({ type: 'START_NEXT', challenge: next });
    });
  };

  const timerPct = (timeLeft / TIMER_SECONDS) * 100;
  const timerColor = timeLeft > 10 ? 'bg-green-400' : timeLeft > 5 ? 'bg-yellow-400' : 'bg-red-400';

  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-stone-100 px-5 py-3">
        <span className="text-sm font-medium text-stone-500">{t('daily')}</span>
        <span className="font-display text-sm font-bold text-stone-900">
          {t('score', { correct: score.correct, total: score.total })}
        </span>
      </div>

      <div className="h-1.5 bg-stone-100">
        <div
          style={{ '--bar-w': `${timerPct}%` } as CSSProperties}
          className={cn(
            'h-full w-[var(--bar-w)] transition-[width] duration-1000 ease-linear',
            timerColor,
          )}
        />
      </div>

      <div className="p-5">
        <div className="mb-3 flex h-6 items-center justify-end">
          {!isRevealed && (
            <span
              className={cn(
                'font-mono text-sm font-bold',
                timeLeft <= 5 ? 'text-red-500' : 'text-stone-400',
              )}
            >
              {t('timer', { seconds: timeLeft })}
            </span>
          )}
        </div>

        <div className="flex items-center justify-center py-2">
          <Image
            src={getOfficialArtworkUrl(challenge.correct.id)}
            alt={isRevealed ? challenge.correct.displayName : t('mystery')}
            width={220}
            height={220}
            className={cn(
              'select-none transition-[filter] duration-700 ease-out',
              !isRevealed && 'brightness-0',
            )}
            priority
          />
        </div>

        {isRevealed && (
          <p className="mb-3 text-center font-display text-xl font-black tracking-tight text-stone-900">
            {challenge.correct.displayName}
          </p>
        )}

        <div className="grid grid-cols-2 gap-2.5">
          {challenge.choices.map((pokemon: PokemonSummary) => {
            const isThisCorrect = pokemon.id === challenge.correct.id;
            const isThisSelected = pokemon.id === selectedId;

            return (
              <button
                key={pokemon.id}
                type="button"
                onClick={() => handleGuess(pokemon.id)}
                disabled={isRevealed || isPending}
                className={cn(
                  'flex items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-left text-sm font-semibold transition-colors',
                  !isRevealed &&
                    'border-stone-200 bg-white text-stone-800 hover:border-stone-400 hover:bg-stone-50 active:scale-[0.98]',
                  isRevealed && isThisCorrect && 'border-green-400 bg-green-50 text-green-900',
                  isRevealed &&
                    isThisSelected &&
                    !isThisCorrect &&
                    'border-red-400 bg-red-50 text-red-900',
                  isRevealed &&
                    !isThisCorrect &&
                    !isThisSelected &&
                    'border-stone-100 bg-stone-50 text-stone-400',
                )}
              >
                {isRevealed && (
                  <Image
                    src={pokemon.sprite}
                    alt={pokemon.displayName}
                    width={36}
                    height={36}
                    className="shrink-0"
                    unoptimized
                  />
                )}
                <span className="flex-1 truncate">{pokemon.displayName}</span>
                {isRevealed && isThisCorrect && (
                  <span className="ml-auto shrink-0 text-green-600">✓</span>
                )}
                {isRevealed && isThisSelected && !isThisCorrect && (
                  <span className="ml-auto shrink-0 text-red-600">✗</span>
                )}
              </button>
            );
          })}
        </div>

        {isRevealed && (
          <div className="mt-5 flex items-center justify-between">
            <p
              className={cn(
                'text-sm font-semibold',
                timedOut && 'text-stone-500',
                isCorrectGuess && 'text-green-600',
                !timedOut && !isCorrectGuess && 'text-red-600',
              )}
            >
              {timedOut
                ? t('timeout', { name: challenge.correct.displayName })
                : isCorrectGuess
                  ? t('correct')
                  : t('wrong', { name: challenge.correct.displayName })}
            </p>
            <button
              type="button"
              onClick={handleNextRound}
              disabled={isPending}
              className="rounded-xl bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-stone-700 disabled:opacity-50"
            >
              {isPending ? t('loading') : t('nextRound')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
