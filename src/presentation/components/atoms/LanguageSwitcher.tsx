'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { cn } from '@/presentation/lib/utils';

const LOCALE_LABELS: Record<Locale, string> = {
  en: 'EN',
  es: 'ES',
  it: 'IT',
  pt: 'PT',
  de: 'DE',
  fr: 'FR',
};

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (next: Locale) => {
    router.replace(pathname, { locale: next });
  };

  return (
    <div className="flex items-center gap-0.5 rounded-md border border-stone-200 bg-stone-50 p-0.5">
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => handleChange(l)}
          className={cn(
            'rounded px-2 py-0.5 text-xs font-medium tracking-wide transition-colors',
            locale === l
              ? 'bg-white text-stone-800 shadow-sm'
              : 'text-stone-400 hover:text-stone-600',
          )}
          aria-current={locale === l ? 'true' : undefined}
        >
          {LOCALE_LABELS[l]}
        </button>
      ))}
    </div>
  );
}
