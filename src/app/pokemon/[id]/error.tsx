'use client';

import Link from 'next/link';
import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <span className="mb-4 select-none text-6xl">⚠️</span>
      <h1 className="mb-2 font-display text-2xl font-bold text-stone-900">
        Failed to load Pokémon
      </h1>
      <p className="mb-6 text-sm text-stone-500">
        {error.message || 'Something went wrong. Please try again.'}
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-stone-700"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-xl border border-stone-200 px-5 py-2.5 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50"
        >
          Back to Pokédex
        </Link>
      </div>
    </div>
  );
}
