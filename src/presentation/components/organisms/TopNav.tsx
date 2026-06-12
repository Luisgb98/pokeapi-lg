'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { LayoutGrid, Users, Scale, Gamepad2, Heart } from 'lucide-react';
import { LanguageSwitcher } from '@/presentation/components/atoms/LanguageSwitcher';
import { ThemeToggle } from '@/presentation/components/atoms/ThemeToggle';
import { useHydration } from '@/presentation/hooks/useHydration';
import { useFavoritesStore } from '@/presentation/store/favoritesStore';
import { cn } from '@/presentation/lib/utils';

export function TopNav() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const hydrated = useHydration();
  const favCount = useFavoritesStore((s) => s.count());

  const tabs = [
    { href: '/' as const, label: t('pokedex'), icon: LayoutGrid, badge: null },
    { href: '/team' as const, label: t('teamBuilder'), icon: Users, badge: null },
    { href: '/compare' as const, label: t('compare'), icon: Scale, badge: null },
    { href: '/game' as const, label: t('game'), icon: Gamepad2, badge: null },
    {
      href: '/favorites' as const,
      label: t('favorites'),
      icon: Heart,
      badge: hydrated && favCount > 0 ? favCount : null,
    },
  ];

  return (
    <>
      {/* Top bar */}
      <nav className="sticky top-0 z-30 border-b border-stone-200 bg-white/90 backdrop-blur-sm dark:border-stone-800 dark:bg-stone-950/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1">
            <span
              className="mr-3 select-none font-display text-xl font-black text-stone-900 dark:text-stone-50"
              aria-hidden="true"
            >
              ◉
            </span>
            {/* Desktop tab list — hidden on mobile */}
            <div
              className="hidden items-center gap-0.5 sm:flex"
              role="tablist"
              aria-label={t('tools')}
            >
              {tabs.map((tab) => (
                <Link
                  key={tab.href}
                  href={tab.href}
                  role="tab"
                  aria-selected={pathname === tab.href}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                    pathname === tab.href
                      ? 'bg-stone-900 text-white dark:bg-stone-50 dark:text-stone-900'
                      : 'text-stone-500 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100',
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
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </div>
      </nav>

      {/* Bottom nav — mobile only */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-30 border-t border-stone-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm dark:border-stone-800 dark:bg-stone-950/95 sm:hidden"
        aria-label={t('tools')}
      >
        <div className="flex items-stretch">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-center text-[10px] font-medium leading-tight transition-colors',
                  isActive
                    ? 'text-stone-900 dark:text-stone-50'
                    : 'text-stone-400 dark:text-stone-500',
                )}
              >
                <div className="relative">
                  <Icon
                    className={cn('size-5', isActive ? 'stroke-[2.5]' : 'stroke-[1.5]')}
                    aria-hidden="true"
                  />
                  {tab.badge !== null && (
                    <span className="absolute -right-1.5 -top-1.5 flex h-3.5 min-w-[0.875rem] items-center justify-center rounded-full bg-rose-500 px-0.5 font-mono text-[9px] font-bold text-white">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className="max-w-[5rem] truncate px-0.5">{tab.label}</span>
                {isActive && (
                  <span className="absolute inset-x-0 bottom-0 mx-auto h-0.5 w-8 rounded-full bg-stone-900 dark:bg-stone-50" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
