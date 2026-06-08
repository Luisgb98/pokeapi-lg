import { useEffect, useState } from 'react';

/**
 * Returns false on the server and on the first client render, then true.
 * Use to gate any localStorage-backed state so SSR markup matches the
 * dehydrated (empty) client state before hydration completes.
 */
export function useHydration(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  return hydrated;
}
