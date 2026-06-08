import { SkeletonCard } from '@/presentation/components/atoms/SkeletonCard';

export default function Loading() {
  return (
    <div className="min-h-dvh">
      <header className="mx-auto max-w-7xl px-4 pb-4 pt-8 sm:px-6 lg:px-8">
        <div className="h-10 w-32 animate-pulse rounded-lg bg-stone-200" />
        <div className="mt-1 h-4 w-64 animate-pulse rounded-full bg-stone-100" />
      </header>

      <div className="sticky top-0 z-20 border-b border-stone-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex gap-2">
            <div className="h-10 flex-1 animate-pulse rounded-xl bg-stone-100" />
            <div className="h-10 w-36 animate-pulse rounded-xl bg-stone-100" />
            <div className="h-10 w-32 animate-pulse rounded-xl bg-stone-100" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <div className="mb-5 h-4 w-16 animate-pulse rounded-full bg-stone-100" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 18 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
