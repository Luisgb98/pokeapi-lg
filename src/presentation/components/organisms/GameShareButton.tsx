'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useGameStore, MAX_ROUNDS } from '@/presentation/store/gameStore';
import { buildShareUrl, buildShareText } from '@/presentation/lib/gameShare';

export function GameShareButton() {
  const t = useTranslations('game');
  const locale = useLocale();
  const { score, dailySeed } = useGameStore();
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = buildShareUrl(score.correct, MAX_ROUNDS, dailySeed, locale);
    const text = buildShareText(score.correct, MAX_ROUNDS);
    const shareData = { title: "Who's That Pokémon?", text, url };

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="mt-3 w-full rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
    >
      {copied ? t('shareCopied') : t('shareResult')}
    </button>
  );
}
