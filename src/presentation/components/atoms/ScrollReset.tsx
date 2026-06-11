'use client';

import { useLayoutEffect } from 'react';

export function ScrollReset() {
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return null;
}
