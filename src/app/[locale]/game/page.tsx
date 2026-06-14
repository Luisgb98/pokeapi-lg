import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { HelpCircle, Swords } from 'lucide-react';
import { SharedGameResult } from '@/presentation/components/organisms/SharedGameResult';
import { GameModeCard } from '@/presentation/components/organisms/GameModeCard';
import { parseGameShareParams } from '@/presentation/lib/gameShare';

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ result?: string; total?: string; day?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'gamesHub' });
  return { title: t('heading') };
}

const MODES = [
  { href: '/game/whos-that' as const, key: 'whosThat', Icon: HelpCircle },
  { href: '/game/type-quiz' as const, key: 'typeQuiz', Icon: Swords },
] as const;

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

  const t = await getTranslations({ locale, namespace: 'gamesHub' });

  return (
    <div className="min-h-dvh">
      <header className="mx-auto max-w-sm px-4 pb-4 pt-8">
        <h1 className="font-display text-3xl font-black tracking-tight text-stone-900 sm:text-4xl dark:text-stone-50">
          {t('heading')}
        </h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{t('subtitle')}</p>
      </header>

      <div className="mx-auto max-w-sm px-4 pb-16 pt-4">
        <ul className="flex flex-col gap-3" role="list">
          {MODES.map(({ href, key, Icon }) => (
            <li key={key}>
              <GameModeCard
                href={href}
                title={t(`modes.${key}.title`)}
                blurb={t(`modes.${key}.blurb`)}
                Icon={Icon}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
