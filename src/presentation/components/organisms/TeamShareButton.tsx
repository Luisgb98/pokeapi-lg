'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useTeamBuilderStore } from '@/presentation/store/teamBuilderStore';
import { buildTeamUrl } from '@/presentation/lib/teamShare';
import { Button } from '@/presentation/components/ui/button';

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
    <Button
      type="button"
      onClick={handleShare}
      disabled={team.length === 0}
      variant="default"
      size="sm"
    >
      {copied ? (
        <svg
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 1 1 0-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 1 0 5.367-2.684 3 3 0 0 0-5.367 2.684zm0 9.316a3 3 0 1 0 5.368 2.684 3 3 0 0 0-5.368-2.684z"
          />
        </svg>
      )}
      {copied ? t('shareCopied') : t('shareTeam')}
    </Button>
  );
}
