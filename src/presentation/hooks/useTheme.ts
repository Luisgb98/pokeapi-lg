'use client';

import { useEffect, useRef, useState } from 'react';

type Theme = 'light' | 'dark';

function getStoredTheme(): Theme {
  const stored = localStorage.getItem('theme') as Theme | null;
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function useTheme() {
  // Always start with 'light' so server and client first renders agree.
  // The real value is synced from localStorage in the effect below.
  const [theme, setTheme] = useState<Theme>('light');

  // Skip the very first classList apply so the server-set dark class on <html>
  // is not removed during hydration before the real theme is loaded.
  const skipFirst = useRef(true);

  // Sync real preference from storage once on mount.
  useEffect(() => {
    setTheme(getStoredTheme());
  }, []);

  // Apply classList + persist on change; skip the initial 'light' default run.
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

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return { theme, toggle };
}
