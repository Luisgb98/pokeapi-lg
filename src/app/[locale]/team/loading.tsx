export default function TeamLoading() {
  return (
    <div className="min-h-dvh">
      <header className="mx-auto max-w-7xl px-4 pb-4 pt-8 sm:px-6 lg:px-8">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-stone-200 dark:bg-stone-700" />
        <div className="mt-1 h-4 w-72 animate-pulse rounded-full bg-stone-100 dark:bg-stone-800" />
      </header>

      <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square animate-pulse rounded-2xl bg-stone-100 dark:bg-stone-800"
            />
          ))}
        </div>

        <div className="mt-6 h-12 animate-pulse rounded-xl bg-stone-100 dark:bg-stone-800" />

        <div className="mt-8 h-6 w-40 animate-pulse rounded-full bg-stone-200 dark:bg-stone-700" />
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-stone-100 dark:bg-stone-800" />
          ))}
        </div>
      </div>
    </div>
  );
}
