// @vitest-environment jsdom
import { renderHook, act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useTheme } from '@/presentation/hooks/useTheme';

const matchMediaMock = vi.fn(() => ({
  matches: false,
  media: '',
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear();
    Object.defineProperty(window, 'matchMedia', { writable: true, value: matchMediaMock });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('returns the stored light theme', () => {
    localStorage.setItem('theme', 'light');
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('light');
  });

  it('returns the stored dark theme', () => {
    localStorage.setItem('theme', 'dark');
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('dark');
  });

  it('toggles theme from light to dark', () => {
    localStorage.setItem('theme', 'light');
    const { result } = renderHook(() => useTheme());
    act(() => {
      result.current.toggle();
    });
    expect(result.current.theme).toBe('dark');
  });

  it('toggles theme from dark to light', () => {
    localStorage.setItem('theme', 'dark');
    const { result } = renderHook(() => useTheme());
    act(() => {
      result.current.toggle();
    });
    expect(result.current.theme).toBe('light');
  });

  it('broadcasts to all subscribed hooks when toggle is called', () => {
    localStorage.setItem('theme', 'light');
    const { result: hookA } = renderHook(() => useTheme());
    const { result: hookB } = renderHook(() => useTheme());
    act(() => {
      hookA.current.toggle();
    });
    expect(hookA.current.theme).toBe('dark');
    expect(hookB.current.theme).toBe('dark');
  });

  it('removes the listener after unmount (no stale callbacks)', () => {
    localStorage.setItem('theme', 'light');
    const { result: hookA, unmount } = renderHook(() => useTheme());
    const { result: hookB } = renderHook(() => useTheme());
    unmount();
    // Toggling from hookB must not throw even though hookA is gone
    act(() => {
      hookB.current.toggle();
    });
    expect(hookB.current.theme).toBe('dark');
  });
});
