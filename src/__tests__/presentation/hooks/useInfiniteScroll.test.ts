// @vitest-environment jsdom
import React from 'react';
import { render, renderHook, act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useInfiniteScroll } from '@/presentation/hooks/useInfiniteScroll';

describe('useInfiniteScroll', () => {
  let observerCallback: IntersectionObserverCallback;
  const mockObserver = {
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Must use a regular function (not arrow) so `new IntersectionObserver()` works
    const IOConstructor = vi.fn(function (
      this: typeof mockObserver,
      cb: IntersectionObserverCallback,
    ) {
      observerCallback = cb;
      this.observe = mockObserver.observe;
      this.disconnect = mockObserver.disconnect;
      this.unobserve = mockObserver.unobserve;
    });
    vi.stubGlobal('IntersectionObserver', IOConstructor);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns a ref object', () => {
    const { result } = renderHook(() => useInfiniteScroll(vi.fn(), false));
    expect(result.current).toHaveProperty('current');
  });

  it('does not create an observer when enabled is false', () => {
    renderHook(() => useInfiniteScroll(vi.fn(), false));
    expect(globalThis.IntersectionObserver).not.toHaveBeenCalled();
  });

  it('calls onIntersect when the sentinel enters the viewport', () => {
    const onIntersect = vi.fn();

    function Sentinel() {
      const ref = useInfiniteScroll(onIntersect, true);
      return React.createElement('div', { ref });
    }

    render(React.createElement(Sentinel));

    act(() => {
      observerCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        mockObserver as unknown as IntersectionObserver,
      );
    });

    expect(onIntersect).toHaveBeenCalledOnce();
  });

  it('does not call onIntersect when isIntersecting is false', () => {
    const onIntersect = vi.fn();

    function Sentinel() {
      const ref = useInfiniteScroll(onIntersect, true);
      return React.createElement('div', { ref });
    }

    render(React.createElement(Sentinel));

    act(() => {
      observerCallback(
        [{ isIntersecting: false } as IntersectionObserverEntry],
        mockObserver as unknown as IntersectionObserver,
      );
    });

    expect(onIntersect).not.toHaveBeenCalled();
  });

  it('disconnects the observer on unmount', () => {
    const onIntersect = vi.fn();

    function Sentinel() {
      const ref = useInfiniteScroll(onIntersect, true);
      return React.createElement('div', { ref });
    }

    const { unmount } = render(React.createElement(Sentinel));
    unmount();

    expect(mockObserver.disconnect).toHaveBeenCalledOnce();
  });
});
