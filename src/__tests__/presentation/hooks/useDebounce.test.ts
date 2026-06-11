// @vitest-environment jsdom
import { renderHook, act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDebounce } from '@/presentation/hooks/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 300));
    expect(result.current).toBe('initial');
  });

  it('does not update before the delay elapses', () => {
    const { result, rerender } = renderHook(
      ({ value, delayMs }: { value: string; delayMs: number }) => useDebounce(value, delayMs),
      { initialProps: { value: 'initial', delayMs: 300 } },
    );
    rerender({ value: 'updated', delayMs: 300 });
    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(result.current).toBe('initial');
  });

  it('updates after the delay elapses', () => {
    const { result, rerender } = renderHook(
      ({ value, delayMs }: { value: string; delayMs: number }) => useDebounce(value, delayMs),
      { initialProps: { value: 'initial', delayMs: 300 } },
    );
    rerender({ value: 'updated', delayMs: 300 });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe('updated');
  });

  it('returns the last value when multiple rapid updates occur', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebounce(value, 300),
      { initialProps: { value: 'first' } },
    );
    rerender({ value: 'second' });
    rerender({ value: 'third' });
    rerender({ value: 'fourth' });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe('fourth');
  });

  it('respects a 200ms delay', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebounce(value, 200),
      { initialProps: { value: 'before' } },
    );
    rerender({ value: 'after' });
    act(() => {
      vi.advanceTimersByTime(199);
    });
    expect(result.current).toBe('before');
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe('after');
  });

  it('respects a 500ms delay', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebounce(value, 500),
      { initialProps: { value: 'before' } },
    );
    rerender({ value: 'after' });
    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(result.current).toBe('before');
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe('after');
  });
});
