import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getRepository } from '@/application/container';
import { getGameChallenge, getDailySeed } from '@/application/usecases/getGameChallenge';
import { WhosThatPokemon } from '@/presentation/components/organisms/WhosThatPokemon';

export const revalidate = 3600;

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'game' });
  return { title: t('heading') };
}

export default async function GamePage() {
  const repository = getRepository();
  const seed = getDailySeed();
  const challenge = await getGameChallenge(repository, seed);
  const t = await getTranslations('game');

  return (
    <div className="min-h-dvh">
      <header className="mx-auto max-w-2xl px-4 pb-4 pt-8 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-black tracking-tight text-stone-900 sm:text-4xl">
          {t('heading')}
        </h1>
        <p className="mt-1 text-sm text-stone-500">{t('subtitle')}</p>
      </header>

      <div className="mx-auto max-w-2xl px-4 pb-16 pt-4 sm:px-6 lg:px-8">
        <WhosThatPokemon initialChallenge={challenge} />
      </div>
    </div>
  );
}
