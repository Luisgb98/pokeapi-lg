import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { TypeCalculator } from '@/presentation/components/organisms/TypeCalculator';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'typeCalculator' });
  return { title: t('heading'), description: t('subtitle') };
}

export default async function TypeCalculatorPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'typeCalculator' });

  return (
    <div className="min-h-dvh">
      <header className="mx-auto max-w-2xl px-4 pb-4 pt-8">
        <h1 className="font-display text-3xl font-black tracking-tight text-stone-900 sm:text-4xl dark:text-stone-50">
          {t('heading')}
        </h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{t('subtitle')}</p>
      </header>
      <div className="mx-auto max-w-2xl px-4 pb-16 pt-4">
        <TypeCalculator />
      </div>
    </div>
  );
}
