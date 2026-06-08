'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/presentation/components/atoms/LanguageSwitcher';
import { useHydration } from '@/presentation/hooks/useHydration';
import { useFavoritesStore } from '@/presentation/store/favoritesStore';
import { cn } from '@/presentation/lib/utils';

export function TopNav() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const hydrated = useHydration();
  const favCount = useFavoritesStore((s) => s.count());

  const tabs = [
    {
      href: '/' as const,
      label: t('pokedex'),
      badge: hydrated && favCount > 0 ? favCount : null,
    },
    { href: '/team' as const, label: t('teamBuilder'), badge: null },
    { href: '/compare' as const, label: t('compare'), badge: null },
    { href: '/game' as const, label: t('game'), badge: null },
  ];

  return (
    <nav className="sticky top-0 z-30 border-b border-stone-200 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1">
          <span
            className="mr-3 select-none font-display text-xl font-black text-stone-900"
            aria-hidden="true"
          >
            ◉
          </span>
          <div className="flex items-center gap-0.5" role="tablist" aria-label="Tools">
            {tabs.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                role="tab"
                aria-selected={pathname === tab.href}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                  pathname === tab.href
                    ? 'bg-stone-900 text-white'
                    : 'text-stone-500 hover:bg-stone-100 hover:text-stone-900',
                )}
              >
                {tab.label}
                {tab.badge !== null && (
                  <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 font-mono text-[10px] font-bold text-white">
                    {tab.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
        <LanguageSwitcher />
      </div>
    </nav>
  );
}
