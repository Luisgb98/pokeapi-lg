import type { LucideIcon } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';

interface Props {
  href: string;
  title: string;
  blurb: string;
  Icon: LucideIcon;
}

export function GameModeCard({ href, title, blurb, Icon }: Props) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-md active:translate-y-0 active:shadow-sm dark:border-stone-700 dark:bg-stone-900 dark:hover:border-stone-600 dark:hover:bg-stone-800/80"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-600 transition-colors group-hover:bg-stone-900 group-hover:text-white dark:bg-stone-800 dark:text-stone-300 dark:group-hover:bg-stone-100 dark:group-hover:text-stone-900">
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-display text-base font-bold tracking-tight text-stone-900 dark:text-stone-50">
          {title}
        </p>
        <p className="mt-0.5 text-sm text-stone-500 dark:text-stone-400">{blurb}</p>
      </div>
      <ArrowRight
        className="mt-1 size-4 shrink-0 text-stone-300 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-stone-500 dark:text-stone-600 dark:group-hover:text-stone-400"
        aria-hidden="true"
      />
    </Link>
  );
}
