'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/presentation/hooks/useTheme';
import { cn } from '@/presentation/lib/utils';

export function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className={cn(
        'flex size-8 items-center justify-center rounded-lg transition-colors',
        'text-stone-500 hover:bg-stone-100 hover:text-stone-700',
        'dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-200',
      )}
    >
      {theme === 'dark' ? (
        <Sun className="size-4" aria-hidden="true" />
      ) : (
        <Moon className="size-4" aria-hidden="true" />
      )}
    </button>
  );
}
