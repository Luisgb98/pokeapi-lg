'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function TeamError({ error, reset }: ErrorProps) {
  const t = useTranslations('error');

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <span className="mb-4 select-none text-6xl">⚠️</span>
      <h1 className="mb-2 font-display text-2xl font-bold text-stone-900">{t('title')}</h1>
      <p className="mb-6 text-sm text-stone-500">{error.message || t('defaultMessage')}</p>
      <button
        type="button"
        onClick={reset}
        className="rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-stone-700"
      >
        {t('retry')}
      </button>
    </div>
  );
}
