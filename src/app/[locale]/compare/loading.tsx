export default function CompareLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="h-9 w-48 animate-pulse rounded-lg bg-stone-200 dark:bg-stone-700" />
        <div className="mt-2 h-4 w-64 animate-pulse rounded bg-stone-100 dark:bg-stone-800" />
      </div>
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-40 animate-pulse rounded-2xl bg-stone-100 dark:bg-stone-800" />
        ))}
      </div>
    </div>
  );
}
