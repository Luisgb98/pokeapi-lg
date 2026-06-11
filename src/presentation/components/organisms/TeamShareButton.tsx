'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useTeamBuilderStore } from '@/presentation/store/teamBuilderStore';
import { buildTeamUrl } from '@/presentation/lib/teamShare';

export function TeamShareButton() {
  const t = useTranslations('teamBuilder');
  const locale = useLocale();
  const team = useTeamBuilderStore((s) => s.team);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = buildTeamUrl(
      team.map((m) => m.id),
      locale,
    );
    if (typeof navigator !== 'undefined' && navigator.share) {
      await navigator.share({ title: t('shareTitle'), url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      disabled={team.length === 0}
      className="text-xs font-medium text-stone-400 transition-colors hover:text-stone-600 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:text-stone-300"
    >
      {copied ? t('shareCopied') : t('shareTeam')}
    </button>
  );
}
