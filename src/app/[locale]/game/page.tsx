import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getRepository } from '@/application/container';
import { getGameChallenge, getDailySeed } from '@/application/usecases/getGameChallenge';
import { WhosThatPokemon } from '@/presentation/components/organisms/WhosThatPokemon';
import { SharedGameResult } from '@/presentation/components/organisms/SharedGameResult';
import { parseGameShareParams } from '@/presentation/lib/gameShare';
import { Link } from '@/i18n/navigation';

export const revalidate = 3600;

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ result?: string; total?: string; day?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'game' });
  return { title: t('heading') };
}

export default async function GamePage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;

  const shared = parseGameShareParams(sp);
  if (shared) {
    return (
      <SharedGameResult
        score={shared.score}
        total={shared.total}
        day={shared.day}
        locale={locale}
      />
    );
  }

  const repository = getRepository();
  const seed = getDailySeed();
  const [challenge, t] = await Promise.all([
    getGameChallenge(repository, seed),
    getTranslations('game'),
  ]);

  return (
    <div className="min-h-dvh">
      <header className="mx-auto max-w-sm px-4 pb-4 pt-8">
        <h1 className="font-display text-3xl font-black tracking-tight text-stone-900 sm:text-4xl dark:text-stone-50">
          {t('heading')}
        </h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{t('subtitle')}</p>
      </header>

      <div className="mx-auto max-w-sm px-4 pb-4 pt-4">
        <WhosThatPokemon initialChallenge={challenge} />
      </div>

      <div className="mx-auto max-w-sm px-4 pb-16">
        <Link
          href="/game/type-quiz"
          className="flex items-center justify-between rounded-xl border border-stone-200 bg-white px-5 py-4 text-sm font-semibold text-stone-700 shadow-sm transition-colors hover:border-stone-300 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:border-stone-600 dark:hover:bg-stone-800"
        >
          {t('typeQuizCta')}
        </Link>
      </div>
    </div>
  );
}
