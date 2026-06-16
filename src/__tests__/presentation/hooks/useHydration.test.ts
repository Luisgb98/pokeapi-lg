// @vitest-environment jsdom
import { renderHook, act } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useHydration } from '@/presentation/hooks/useHydration';

describe('useHydration', () => {
  it('returns true in a browser (jsdom) environment', () => {
    const { result } = renderHook(() => useHydration());
    expect(result.current).toBe(true);
  });

  it('returns true after effects are flushed', () => {
    const { result } = renderHook(() => useHydration());
    act(() => {});
    expect(result.current).toBe(true);
  });

  it('returns a boolean value', () => {
    const { result } = renderHook(() => useHydration());
    expect(typeof result.current).toBe('boolean');
  });

  it('remains stable across rerenders', () => {
    const { result, rerender } = renderHook(() => useHydration());
    rerender();
    expect(result.current).toBe(true);
  });
});
