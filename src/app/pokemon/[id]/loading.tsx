import { Skeleton } from '@/presentation/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="min-h-dvh bg-stone-50">
      <div className="relative overflow-hidden bg-stone-100 pb-8 pt-6">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-8 w-24 rounded-xl bg-stone-200" />
        </div>
        <div className="mx-auto flex max-w-5xl flex-col items-center px-4 pt-4 sm:flex-row sm:items-end sm:gap-8 sm:px-6 lg:px-8">
          <Skeleton className="size-52 shrink-0 rounded-full bg-stone-200 sm:size-64" />
          <div className="mt-4 w-full sm:mt-0 sm:pb-4">
            <Skeleton className="mx-auto mb-2 h-4 w-24 rounded-full bg-stone-200 sm:mx-0" />
            <Skeleton className="mx-auto mb-3 h-12 w-64 rounded-xl bg-stone-200 sm:mx-0" />
            <div className="flex justify-center gap-2 sm:justify-start">
              <Skeleton className="h-7 w-20 rounded-full bg-stone-200" />
              <Skeleton className="h-7 w-24 rounded-full bg-stone-200" />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <Skeleton className="h-64 rounded-2xl bg-stone-200" />
          <Skeleton className="h-64 rounded-2xl bg-stone-200" />
        </div>
      </div>
    </div>
  );
}
