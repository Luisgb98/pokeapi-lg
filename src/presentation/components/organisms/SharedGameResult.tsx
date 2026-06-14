import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

interface Props {
  score: number;
  total: number;
  day: number;
  locale: string;
}

export async function SharedGameResult({ score, total, day, locale }: Props) {
  const t = await getTranslations({ locale, namespace: 'game' });

  // day is UTC days since Unix epoch — convert back to a calendar date
  const date = new Date(day * 86_400_000);
  const dateStr = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);

  const grid = Array.from({ length: total }, (_, i) => (i < score ? '✅' : '❌')).join('');

  return (
    <div className="min-h-dvh">
      <header className="mx-auto max-w-sm px-4 pb-4 pt-8">
        <h1 className="font-display text-3xl font-black tracking-tight text-stone-900 sm:text-4xl dark:text-stone-50">
          {t('heading')}
        </h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{dateStr}</p>
      </header>

      <div className="mx-auto max-w-sm px-4 pb-16 pt-4">
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-stone-700 dark:bg-stone-900">
          <div className="border-b border-stone-100 px-5 py-3 dark:border-stone-800">
            <span className="text-sm font-medium text-stone-500 dark:text-stone-400">
              {t('sharedResultTitle')}
            </span>
          </div>

          <div className="p-6 text-center">
            <p className="font-display text-5xl font-black text-stone-900 dark:text-stone-50">
              {score}
              <span className="text-xl font-bold text-stone-400 dark:text-stone-500">/{total}</span>
            </p>
            <p className="mt-4 text-2xl tracking-widest">{grid}</p>
          </div>

          <div className="px-5 pb-5">
            <Link
              href={`/${locale}/game/whos-that`}
              className="block w-full rounded-xl bg-stone-900 px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200"
            >
              {t('playToday')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
