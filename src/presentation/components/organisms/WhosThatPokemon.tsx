'use client';

import Image from 'next/image';
import { useState, useEffect, useTransition } from 'react';
import type { CSSProperties } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/presentation/lib/utils';
import type { GameChallenge } from '@/application/usecases/getGameChallenge';
import type { PokemonSummary } from '@/domain/entities/Pokemon';
import { getOfficialArtworkUrl } from '@/domain/entities/Pokemon';
import { fetchNextChallenge } from '@/application/actions/game';
import { useGameStore, TIMER_SECONDS, MAX_ROUNDS } from '@/presentation/store/gameStore';
import { GameShareButton } from '@/presentation/components/organisms/GameShareButton';

interface Props {
  initialChallenge: GameChallenge;
}

export function WhosThatPokemon({ initialChallenge }: Props) {
  const t = useTranslations('game');
  const [isPending, startTransition] = useTransition();

  // isReady gates rendering until localStorage is rehydrated, preventing
  // hydration mismatches (server renders skeleton, client fills in real state)
  const [isReady, setIsReady] = useState(false);

  // Timer is local — elapsed time can't be recovered across page reloads
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);

  const {
    phase,
    selectedId,
    score,
    challenge,
    roundOffset,
    initOrRestore,
    guess,
    timeOut,
    startNext,
  } = useGameStore();

  useEffect(() => {
    const init = async () => {
      await useGameStore.persist.rehydrate();
      initOrRestore(initialChallenge);
      setIsReady(true);
    };
    void init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Countdown tick — each render schedules the next decrement
  useEffect(() => {
    if (!isReady || phase !== 'playing' || timeLeft <= 0) return;
    const id = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [isReady, phase, timeLeft]);

  // Trigger timeout when timer hits zero
  useEffect(() => {
    if (isReady && timeLeft === 0 && phase === 'playing') timeOut();
  }, [isReady, timeLeft, phase, timeOut]);

  if (!isReady || !challenge) {
    return (
      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-stone-700 dark:bg-stone-900">
        <div className="flex items-center justify-between border-b border-stone-100 px-5 py-3 dark:border-stone-800">
          <div className="h-4 w-24 animate-pulse rounded-full bg-stone-100 dark:bg-stone-800" />
          <div className="h-4 w-16 animate-pulse rounded-full bg-stone-100 dark:bg-stone-800" />
        </div>
        <div className="h-1.5 animate-pulse bg-stone-100 dark:bg-stone-800" />
        <div className="p-5">
          <div className="mb-3 h-6" />
          <div className="mx-auto flex h-56 w-56 items-center justify-center">
            <div className="h-48 w-48 animate-pulse rounded-full bg-stone-100 dark:bg-stone-800" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-12 animate-pulse rounded-xl bg-stone-100 dark:bg-stone-800"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const isRevealed = phase === 'revealed';
  const timedOut = isRevealed && selectedId === null;
  const isCorrectGuess = isRevealed && selectedId === challenge.correct.id;
  const isGameOver = isRevealed && score.total >= MAX_ROUNDS;
  const currentRound = phase === 'playing' ? score.total + 1 : score.total;

  const timerPct = isRevealed ? 0 : (timeLeft / TIMER_SECONDS) * 100;
  const timerColor = timeLeft > 10 ? 'bg-green-400' : timeLeft > 5 ? 'bg-yellow-400' : 'bg-red-400';

  const handleGuess = (pokemonId: number) => {
    if (isRevealed) return;
    guess(pokemonId);
  };

  const handleNextRound = () => {
    setTimeLeft(TIMER_SECONDS);
    startTransition(async () => {
      const next = await fetchNextChallenge(roundOffset + 1);
      startNext(next);
    });
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-stone-700 dark:bg-stone-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-100 px-5 py-3 dark:border-stone-800">
        <span className="text-sm font-medium text-stone-500 dark:text-stone-400">{t('daily')}</span>
        <span className="font-display text-sm font-bold text-stone-900 dark:text-stone-50">
          {isGameOver
            ? t('score', { correct: score.correct, total: MAX_ROUNDS })
            : t('roundOf', { current: currentRound, total: MAX_ROUNDS })}
        </span>
      </div>

      {/* Timer bar — only transitions during play, snaps to 0 on reveal */}
      <div className="h-1.5 bg-stone-100 dark:bg-stone-800">
        {!isGameOver && (
          <div
            style={{ '--bar-w': `${timerPct}%` } as CSSProperties}
            className={cn(
              'h-full w-[var(--bar-w)]',
              !isRevealed && 'transition-[width] duration-1000 ease-linear',
              timerColor,
            )}
          />
        )}
      </div>

      <div className="p-5">
        {/* Timer countdown */}
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

        {/* Pokémon image — transition only when revealing; snaps to black on new round */}
        <div className="flex items-center justify-center py-2">
          <Image
            src={getOfficialArtworkUrl(challenge.correct.id)}
            alt={isRevealed ? challenge.correct.displayName : t('mystery')}
            width={220}
            height={220}
            className={cn(
              'select-none',
              isRevealed ? 'transition-[filter] duration-700 ease-out' : 'brightness-0',
            )}
            priority
          />
        </div>

        {isRevealed && (
          <p className="mb-3 text-center font-display text-xl font-black tracking-tight text-stone-900 dark:text-stone-50">
            {challenge.correct.displayName}
          </p>
        )}

        {/* Choice buttons */}
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
                    'border-stone-200 bg-white text-stone-800 hover:border-stone-400 hover:bg-stone-50 active:scale-[0.98] dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:border-stone-500 dark:hover:bg-stone-700',
                  isRevealed &&
                    isThisCorrect &&
                    'border-green-400 bg-green-50 text-green-900 dark:border-green-700 dark:bg-green-950 dark:text-green-300',
                  isRevealed &&
                    isThisSelected &&
                    !isThisCorrect &&
                    'border-red-400 bg-red-50 text-red-900 dark:border-red-700 dark:bg-red-950 dark:text-red-300',
                  isRevealed &&
                    !isThisCorrect &&
                    !isThisSelected &&
                    'border-stone-100 bg-stone-50 text-stone-400 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-600',
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

        {/* Action area */}
        {isRevealed && (
          <div className="mt-5">
            {isGameOver ? (
              <div className="rounded-xl bg-stone-50 px-5 py-5 text-center dark:bg-stone-800">
                <p className="font-display text-lg font-bold text-stone-900 dark:text-stone-50">
                  {t('gameOver')}
                </p>
                <p className="mt-1 font-display text-5xl font-black text-stone-900 dark:text-stone-50">
                  {score.correct}
                  <span className="text-xl font-bold text-stone-400 dark:text-stone-500">
                    /{MAX_ROUNDS}
                  </span>
                </p>
                <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
                  {t('gameOverSubtitle')}
                </p>
                <GameShareButton />
              </div>
            ) : (
              <div className="flex items-center justify-between">
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
        )}
      </div>
    </div>
  );
}
