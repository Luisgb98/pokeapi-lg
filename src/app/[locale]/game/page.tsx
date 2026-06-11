import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getRepository } from '@/application/container';
import { getGameChallenge, getDailySeed } from '@/application/usecases/getGameChallenge';
import { WhosThatPokemon } from '@/presentation/components/organisms/WhosThatPokemon';
import { SharedGameResult } from '@/presentation/components/organisms/SharedGameResult';
import { MAX_ROUNDS } from '@/presentation/store/gameStore';

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

  if (sp.result !== undefined && sp.day !== undefined) {
    const day = parseInt(sp.day, 10);
    if (!Number.isNaN(day)) {
      const score = Math.max(0, Math.min(parseInt(sp.result, 10) || 0, MAX_ROUNDS));
      const total = Math.max(
        1,
        Math.min(parseInt(sp.total ?? String(MAX_ROUNDS), 10) || MAX_ROUNDS, MAX_ROUNDS),
      );
      return <SharedGameResult score={score} total={total} day={day} locale={locale} />;
    }
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

      <div className="mx-auto max-w-sm px-4 pb-16 pt-4">
        <WhosThatPokemon initialChallenge={challenge} />
      </div>
    </div>
  );
}
