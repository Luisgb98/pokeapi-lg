'use client';

import { cn } from '@/presentation/lib/utils';

interface FavoriteButtonProps {
  isFavorite: boolean;
  label: string;
  onToggle: (e: React.MouseEvent) => void;
  size?: 'sm' | 'md';
  className?: string;
}

export function FavoriteButton({
  isFavorite,
  label,
  onToggle,
  size = 'md',
  className,
}: FavoriteButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={isFavorite}
      onClick={onToggle}
      className={cn(
        'flex items-center justify-center rounded-full transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400',
        size === 'sm'
          ? 'size-7 hover:bg-rose-50 active:scale-90 dark:hover:bg-rose-950'
          : 'size-10 hover:bg-rose-50 active:scale-90 dark:hover:bg-rose-950',
        className,
      )}
    >
      <svg
        viewBox="0 0 24 24"
        className={cn(
          'transition-all duration-200',
          size === 'sm' ? 'size-4' : 'size-5',
          isFavorite
            ? 'fill-rose-500 stroke-rose-500'
            : 'fill-none stroke-stone-400 hover:stroke-rose-400 dark:stroke-stone-500',
        )}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
