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
    <>
      {/* Mobile: native select */}
      <select
        value={locale}
        onChange={(e) => handleChange(e.target.value as Locale)}
        aria-label="Language"
        className="rounded-md border border-stone-200 bg-stone-50 px-2 py-1.5 text-xs font-medium text-stone-700 focus:outline-none focus:ring-1 focus:ring-stone-400 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 sm:hidden"
      >
        {routing.locales.map((l) => (
          <option key={l} value={l}>
            {LOCALE_LABELS[l]}
          </option>
        ))}
      </select>

      {/* Desktop: pill buttons */}
      <div className="hidden items-center gap-0.5 rounded-md border border-stone-200 bg-stone-50 p-0.5 dark:border-stone-700 dark:bg-stone-800 sm:flex">
        {routing.locales.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => handleChange(l)}
            className={cn(
              'rounded px-2 py-0.5 text-xs font-medium tracking-wide transition-colors',
              locale === l
                ? 'bg-white text-stone-800 shadow-sm dark:bg-stone-700 dark:text-stone-100'
                : 'text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300',
            )}
            aria-current={locale === l ? 'true' : undefined}
          >
            {LOCALE_LABELS[l]}
          </button>
        ))}
      </div>
    </>
  );
}
