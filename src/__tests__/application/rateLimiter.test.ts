import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  checkRateLimit,
  resetRateLimiter,
  RATE_LIMIT_MAX,
  RATE_LIMIT_WINDOW_MS,
} from '@/application/lib/rateLimiter';

beforeEach(() => resetRateLimiter());
afterEach(() => vi.useRealTimers());

describe('checkRateLimit', () => {
  it('allows the first request for a new user', () => {
    expect(checkRateLimit('user-1')).toBe(true);
  });

  it('allows requests up to the limit', () => {
    for (let i = 0; i < RATE_LIMIT_MAX; i++) {
      expect(checkRateLimit('user-1')).toBe(true);
    }
  });

  it('blocks the request that exceeds the limit', () => {
    for (let i = 0; i < RATE_LIMIT_MAX; i++) {
      checkRateLimit('user-1');
    }
    expect(checkRateLimit('user-1')).toBe(false);
  });

  it('keeps blocking after the limit is exceeded', () => {
    for (let i = 0; i < RATE_LIMIT_MAX + 5; i++) {
      checkRateLimit('user-1');
    }
    expect(checkRateLimit('user-1')).toBe(false);
  });

  it('is isolated per user', () => {
    for (let i = 0; i < RATE_LIMIT_MAX; i++) {
      checkRateLimit('user-1');
    }
    expect(checkRateLimit('user-2')).toBe(true);
  });

  it('resets after the window expires', () => {
    vi.useFakeTimers();
    for (let i = 0; i < RATE_LIMIT_MAX; i++) {
      checkRateLimit('user-1');
    }
    expect(checkRateLimit('user-1')).toBe(false);

    vi.advanceTimersByTime(RATE_LIMIT_WINDOW_MS + 1);
    expect(checkRateLimit('user-1')).toBe(true);
  });
});

describe('resetRateLimiter', () => {
  it('clears rate-limit state so blocked users become allowed again', () => {
    for (let i = 0; i < RATE_LIMIT_MAX; i++) {
      checkRateLimit('user-1');
    }
    expect(checkRateLimit('user-1')).toBe(false);

    resetRateLimiter();
    expect(checkRateLimit('user-1')).toBe(true);
  });
});
