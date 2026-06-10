import { Skeleton } from '@/presentation/components/ui/skeleton';

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900">
      <Skeleton className="mx-auto mb-4 size-28 rounded-xl bg-stone-100 dark:bg-stone-800" />
      <Skeleton className="mx-auto mb-2 h-5 w-24 rounded-full bg-stone-100 dark:bg-stone-800" />
      <Skeleton className="mx-auto mb-3 h-4 w-16 rounded-full bg-stone-100 dark:bg-stone-800" />
      <div className="flex justify-center gap-1.5">
        <Skeleton className="h-5 w-16 rounded-full bg-stone-100 dark:bg-stone-800" />
      </div>
    </div>
  );
}
