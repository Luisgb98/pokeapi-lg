'use client';

import { useState, useEffect } from 'react';
import type { CSSProperties } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/presentation/lib/utils';
import { TypeBadge } from '@/presentation/components/atoms/TypeBadge';
import { getTypeQuizQuestion } from '@/domain/usecases/getTypeQuizQuestion';
import type { PokemonType } from '@/domain/entities/Pokemon';
import {
  useTypeQuizStore,
  TIMER_SECONDS,
  MAX_QUIZ_ROUNDS,
} from '@/presentation/store/typeQuizStore';

export function TypeQuiz() {
  const t = useTranslations('typeQuiz');
  const tTypes = useTranslations('types');

  const [isReady, setIsReady] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);

  const {
    phase,
    selected,
    score,
    round,
    streak,
    bestScore,
    lastCompletedSeed,
    dailySeed,
    initOrRestore,
    answer,
    timeOut,
    next,
  } = useTypeQuizStore();

  useEffect(() => {
    const init = async () => {
      await useTypeQuizStore.persist.rehydrate();
      initOrRestore();
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

  if (!isReady) {
    return (
      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-stone-700 dark:bg-stone-900">
        <div className="flex items-center justify-between border-b border-stone-100 px-5 py-3 dark:border-stone-800">
          <div className="h-4 w-24 animate-pulse rounded-full bg-stone-100 dark:bg-stone-800" />
          <div className="h-4 w-16 animate-pulse rounded-full bg-stone-100 dark:bg-stone-800" />
        </div>
        <div className="h-1.5 animate-pulse bg-stone-100 dark:bg-stone-800" />
        <div className="p-5">
          <div className="mb-3 h-6" />
          <div className="mb-4 h-16 animate-pulse rounded-xl bg-stone-100 dark:bg-stone-800" />
          <div className="grid grid-cols-2 gap-2.5">
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

  const question = getTypeQuizQuestion(dailySeed, round);
  const isRevealed = phase === 'revealed';
  const isGameOver = isRevealed && score.total >= MAX_QUIZ_ROUNDS;
  const currentRound = phase === 'playing' ? round + 1 : score.total;

  const displayStreak =
    lastCompletedSeed !== null && lastCompletedSeed >= dailySeed - 1 ? streak : 0;

  const timerPct = isRevealed ? 0 : (timeLeft / TIMER_SECONDS) * 100;
  const timerColor = timeLeft > 10 ? 'bg-green-400' : timeLeft > 5 ? 'bg-yellow-400' : 'bg-red-400';

  const isTimedOut = isRevealed && selected === null;
  const isCorrectGuess = isRevealed && selected === question.correct;

  const handleAnswer = (type: PokemonType) => {
    if (isRevealed) return;
    answer(type);
  };

  const handleNextRound = () => {
    setTimeLeft(TIMER_SECONDS);
    next();
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-stone-700 dark:bg-stone-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-100 px-5 py-3 dark:border-stone-800">
        <span className="text-sm font-medium text-stone-500 dark:text-stone-400">
          {t('heading')}
        </span>
        <span className="font-display text-sm font-bold text-stone-900 dark:text-stone-50">
          {isGameOver
            ? `${score.correct}/${MAX_QUIZ_ROUNDS}`
            : t('roundOf', { current: currentRound, total: MAX_QUIZ_ROUNDS })}
        </span>
      </div>

      {/* Timer bar */}
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
              {timeLeft}s
            </span>
          )}
        </div>

        {/* Question */}
        <div className="mb-4">
          <p className="mb-3 text-sm font-medium text-stone-600 dark:text-stone-400">
            {t('question')}
          </p>
          <div className="flex flex-wrap gap-2">
            {question.defendingTypes.map((type) => (
              <TypeBadge key={type} type={type} label={tTypes(type)} />
            ))}
          </div>
        </div>

        {/* Choice buttons */}
        <div className="grid grid-cols-2 gap-2.5">
          {question.choices.map((type: PokemonType) => {
            const isThisCorrect = type === question.correct;
            const isThisSelected = type === selected;
            return (
              <button
                key={type}
                type="button"
                onClick={() => handleAnswer(type)}
                disabled={isRevealed}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-xl border-2 px-3 py-2.5 transition-colors',
                  !isRevealed &&
                    'border-stone-200 bg-white hover:border-stone-400 hover:bg-stone-50 active:scale-[0.98] dark:border-stone-700 dark:bg-stone-800 dark:hover:border-stone-500 dark:hover:bg-stone-700',
                  isRevealed &&
                    isThisCorrect &&
                    'border-green-400 bg-green-50 dark:border-green-700 dark:bg-green-950',
                  isRevealed &&
                    isThisSelected &&
                    !isThisCorrect &&
                    'border-red-400 bg-red-50 dark:border-red-700 dark:bg-red-950',
                  isRevealed &&
                    !isThisCorrect &&
                    !isThisSelected &&
                    'border-stone-100 bg-stone-50 opacity-50 dark:border-stone-800 dark:bg-stone-900',
                )}
              >
                <TypeBadge type={type} size="sm" label={tTypes(type)} />
                {isRevealed && isThisCorrect && <span className="shrink-0 text-green-600">✓</span>}
                {isRevealed && isThisSelected && !isThisCorrect && (
                  <span className="shrink-0 text-red-600">✗</span>
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
                    /{MAX_QUIZ_ROUNDS}
                  </span>
                </p>
                <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
                  {t('gameOverSubtitle')}
                </p>
                <p className="mt-3 text-sm font-semibold text-stone-700 dark:text-stone-300">
                  {t('streakLabel', { count: displayStreak })} ·{' '}
                  {t('bestLabel', { best: bestScore })}
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p
                  className={cn(
                    'text-sm font-semibold',
                    isTimedOut && 'text-stone-500',
                    isCorrectGuess && 'text-green-600',
                    !isTimedOut && !isCorrectGuess && 'text-red-600',
                  )}
                >
                  {isTimedOut
                    ? t('timeout', { type: tTypes(question.correct) })
                    : isCorrectGuess
                      ? t('correct')
                      : t('wrong', { type: tTypes(question.correct) })}
                </p>
                <button
                  type="button"
                  onClick={handleNextRound}
                  className="rounded-xl bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-stone-700"
                >
                  {t('nextRound')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
