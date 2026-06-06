'use client';

import { useEffect, useRef } from 'react';

/**
 * Attaches an IntersectionObserver to a sentinel element.
 * Calls `onIntersect` when the sentinel enters the viewport (with 200px root margin).
 * Disconnects automatically when `enabled` is false or on unmount.
 */
export function useInfiniteScroll(onIntersect: () => void, enabled: boolean) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onIntersect();
      },
      { rootMargin: '200px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [enabled, onIntersect]);

  return sentinelRef;
}
