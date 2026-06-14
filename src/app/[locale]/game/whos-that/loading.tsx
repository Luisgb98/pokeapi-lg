export default function WhosThatLoading() {
  return (
    <div className="min-h-dvh">
      <header className="mx-auto max-w-2xl px-4 pb-4 pt-8 sm:px-6 lg:px-8">
        <div className="h-10 w-56 animate-pulse rounded-lg bg-stone-200 dark:bg-stone-700" />
        <div className="mt-1 h-4 w-64 animate-pulse rounded-full bg-stone-100 dark:bg-stone-800" />
      </header>

      <div className="mx-auto max-w-2xl px-4 pb-16 pt-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-stone-700 dark:bg-stone-900">
          <div className="flex items-center justify-between border-b border-stone-100 px-5 py-3 dark:border-stone-800">
            <div className="h-4 w-24 animate-pulse rounded-full bg-stone-100 dark:bg-stone-800" />
            <div className="h-4 w-12 animate-pulse rounded-full bg-stone-100 dark:bg-stone-800" />
          </div>
          <div className="h-1.5 w-full animate-pulse bg-stone-100 dark:bg-stone-800" />
          <div className="p-5">
            <div className="mb-3 h-6" />
            <div className="mx-auto mb-4 flex h-56 w-56 items-center justify-center">
              <div className="h-48 w-48 animate-pulse rounded-full bg-stone-100 dark:bg-stone-800" />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-12 animate-pulse rounded-xl bg-stone-100 dark:bg-stone-800"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
