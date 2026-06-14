'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { LogIn, LogOut, User } from 'lucide-react';

export function AuthMenu() {
  const { data: session, status } = useSession();
  const t = useTranslations('auth');

  if (status === 'loading') {
    return <div className="size-8 animate-pulse rounded-full bg-stone-200 dark:bg-stone-700" />;
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-1">
        {session.user.image ? (
          <img
            src={session.user.image}
            alt={session.user.name ?? t('account')}
            title={session.user.name ?? t('account')}
            className="size-7 rounded-full ring-2 ring-stone-200 dark:ring-stone-700"
            width={28}
            height={28}
          />
        ) : (
          <div
            className="flex size-7 items-center justify-center rounded-full bg-stone-200 dark:bg-stone-700"
            title={session.user.name ?? t('account')}
          >
            <User className="size-4 text-stone-500" aria-hidden="true" />
          </div>
        )}
        <button
          onClick={() => signOut()}
          className="rounded-lg p-1.5 text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100"
          title={t('signOut')}
          aria-label={t('signOut')}
        >
          <LogOut className="size-4" aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn('github')}
      className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100"
      aria-label={t('signIn')}
    >
      <LogIn className="size-4" aria-hidden="true" />
      <span className="hidden sm:inline">{t('signIn')}</span>
    </button>
  );
}
