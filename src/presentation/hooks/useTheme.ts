'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';

type Theme = 'light' | 'dark';

// Module-level listener set so toggle() can notify useSyncExternalStore
// without a storage event (which browsers only fire on *other* tabs).
const themeListeners = new Set<() => void>();

function subscribeTheme(callback: () => void): () => void {
  themeListeners.add(callback);
  return () => themeListeners.delete(callback);
}

function getStoredTheme(): Theme {
  const stored = localStorage.getItem('theme') as Theme | null;
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function useTheme() {
  // useSyncExternalStore returns 'light' on the server (third arg = server snapshot)
  // and the real stored preference on the client, avoiding the SSR/client mismatch.
  const theme = useSyncExternalStore(subscribeTheme, getStoredTheme, () => 'light' as Theme);

  // Skip the very first classList apply (theme = server-snapshot 'light') so the
  // server-set dark class on <html> is not disturbed during hydration.
  const skipFirst = useRef(true);

  useEffect(() => {
    if (skipFirst.current) {
      skipFirst.current = false;
      return;
    }
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
    document.cookie = `theme=${theme}; path=/; max-age=31536000; SameSite=Lax`;
  }, [theme]);

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', next);
    themeListeners.forEach((cb) => cb());
  };

  return { theme, toggle };
}
