'use client';

import { useTranslations } from 'next-intl';
import { useLocalImport } from '@/presentation/hooks/useLocalImport';

export function LocalImportBanner() {
  const t = useTranslations('import');
  const { shouldPrompt, snapshot, isImporting, importData, dismiss } = useLocalImport();

  if (!shouldPrompt) return null;

  const parts: string[] = [];
  if (snapshot.favoriteCount > 0) parts.push(t('favorites', { count: snapshot.favoriteCount }));
  if (snapshot.teamCount > 0) parts.push(t('team', { count: snapshot.teamCount }));
  if (snapshot.hasComparison) parts.push(t('comparison'));

  return (
    <div
      role="region"
      aria-label={t('title')}
      className="fixed bottom-20 left-4 right-4 z-50 sm:bottom-6 sm:left-auto sm:right-6 sm:max-w-sm"
    >
      <div className="rounded-2xl border border-stone-200 bg-white/95 p-4 shadow-xl backdrop-blur-sm dark:border-stone-700 dark:bg-stone-900/95">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 text-xl" aria-hidden>
            📦
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-display text-sm font-semibold text-stone-900 dark:text-stone-100">
              {t('title')}
            </p>
            <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">{parts.join(' · ')}</p>
          </div>
          <button
            type="button"
            onClick={dismiss}
            disabled={isImporting}
            aria-label={t('skip')}
            className="shrink-0 rounded-lg p-1 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800 dark:hover:text-stone-300"
          >
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
              <path d="M4.28 3.22a.75.75 0 0 0-1.06 1.06L6.94 8l-3.72 3.72a.75.75 0 1 0 1.06 1.06L8 9.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L9.06 8l3.72-3.72a.75.75 0 0 0-1.06-1.06L8 6.94 4.28 3.22Z" />
            </svg>
          </button>
        </div>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => void importData()}
            disabled={isImporting}
            className="flex-1 rounded-xl bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-orange-600 disabled:opacity-60"
          >
            {isImporting ? t('importing') : t('importButton')}
          </button>
          <button
            type="button"
            onClick={dismiss}
            disabled={isImporting}
            className="rounded-xl border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-50 disabled:opacity-60 dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-800"
          >
            {t('skip')}
          </button>
        </div>
      </div>
    </div>
  );
}
