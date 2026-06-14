export const RATE_LIMIT_MAX = 30;
export const RATE_LIMIT_WINDOW_MS = 10_000;

interface RateWindow {
  count: number;
  windowStart: number;
}

// In-process fixed-window counter keyed by userId.
// Acceptable for single-instance / serverless use; upgrade to Upstash Redis
// for multi-instance deployments that need cross-replica rate limiting.
const windows = new Map<string, RateWindow>();

/**
 * Returns true if the request should be allowed, false if rate limited.
 * Mutating actions should call this after authentication and return
 * err('Too many requests') when it returns false.
 */
export function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const w = windows.get(userId);

  if (!w || now - w.windowStart > RATE_LIMIT_WINDOW_MS) {
    windows.set(userId, { count: 1, windowStart: now });
    return true;
  }

  if (w.count >= RATE_LIMIT_MAX) return false;

  windows.set(userId, { ...w, count: w.count + 1 });
  return true;
}

/** Clears all rate-limit state. For testing only. */
export function resetRateLimiter(): void {
  windows.clear();
}
