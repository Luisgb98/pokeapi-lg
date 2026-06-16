'use client';

import { useState, useMemo } from 'react';
import type { LearnedMove } from '@/domain/entities/Move';

interface MovePickerProps {
  learnedMoves: readonly LearnedMove[];
  selected: readonly string[];
  onChange: (moveNames: readonly string[]) => void;
  searchPlaceholder: string;
  noMovesLabel: string;
  selectUpToFourLabel: string;
}

export function MovePicker({
  learnedMoves,
  selected,
  onChange,
  searchPlaceholder,
  noMovesLabel,
  selectUpToFourLabel,
}: MovePickerProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    const source = q
      ? learnedMoves.filter(
          (lm) =>
            lm.move.displayName.toLowerCase().includes(q) || lm.move.name.toLowerCase().includes(q),
        )
      : learnedMoves;
    const seen = new Set<string>();
    return source.filter((lm) => {
      if (seen.has(lm.move.name)) return false;
      seen.add(lm.move.name);
      return true;
    });
  }, [learnedMoves, search]);

  function toggle(moveName: string) {
    if (selected.includes(moveName)) {
      onChange(selected.filter((m) => m !== moveName));
    } else if (selected.length < 4) {
      onChange([...selected, moveName]);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-stone-500 dark:text-stone-400">{selectUpToFourLabel}</p>
        <span className="text-xs font-medium text-stone-600 dark:text-stone-400">
          {selected.length}/4
        </span>
      </div>

      <input
        type="search"
        placeholder={searchPlaceholder}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="h-8 w-full rounded-md border border-stone-200 bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 dark:border-stone-700"
      />

      {/* Selected moves */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((name) => {
            const lm = learnedMoves.find((m) => m.move.name === name);
            return (
              <button
                key={name}
                type="button"
                onClick={() => toggle(name)}
                className="inline-flex items-center gap-1 rounded-full bg-stone-900 px-2.5 py-0.5 text-xs font-medium text-white dark:bg-stone-100 dark:text-stone-900"
              >
                {lm?.move.displayName ?? name}
                <svg
                  className="size-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            );
          })}
        </div>
      )}

      <div className="max-h-48 overflow-y-auto overscroll-contain rounded-md border border-stone-200 dark:border-stone-700">
        {filtered.length === 0 ? (
          <p className="px-3 py-4 text-center text-xs text-stone-400 dark:text-stone-500">
            {noMovesLabel}
          </p>
        ) : (
          <ul className="divide-y divide-stone-100 dark:divide-stone-800">
            {filtered.map((lm) => {
              const isSelected = selected.includes(lm.move.name);
              const isDisabled = !isSelected && selected.length >= 4;
              return (
                <li key={lm.move.name}>
                  <button
                    type="button"
                    disabled={isDisabled}
                    onClick={() => toggle(lm.move.name)}
                    className={[
                      'flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors',
                      isSelected
                        ? 'bg-stone-900/5 font-medium text-stone-900 dark:bg-stone-100/10 dark:text-stone-100'
                        : 'text-stone-700 dark:text-stone-300',
                      isDisabled
                        ? 'cursor-not-allowed opacity-40'
                        : 'hover:bg-stone-50 dark:hover:bg-stone-800',
                    ].join(' ')}
                  >
                    {isSelected && (
                      <svg
                        className="size-3.5 shrink-0 text-emerald-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {!isSelected && <span className="size-3.5 shrink-0" aria-hidden="true" />}
                    <span className="flex-1">{lm.move.displayName}</span>
                    <span className="text-xs capitalize text-stone-400 dark:text-stone-500">
                      {lm.learnMethod.replace('-', ' ')}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
