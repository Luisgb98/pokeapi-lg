'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';

export default function NotFound() {
  const t = useTranslations('notFound');
  const locale = useLocale();

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <p className="mb-2 select-none font-display text-8xl font-black text-stone-200">404</p>
      <h1 className="mb-2 font-display text-2xl font-bold text-stone-900">{t('title')}</h1>
      <p className="mb-6 text-sm text-stone-500">{t('message')}</p>
      <Link
        href={`/${locale}`}
        className="rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-stone-700"
      >
        {t('backLink')}
      </Link>
    </div>
  );
}
