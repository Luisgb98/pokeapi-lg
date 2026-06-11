import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getOrFetch, TtlCache } from '../../infrastructure/pokeapi/cache';

describe('TtlCache', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('returns undefined for missing keys', () => {
    const cache = new TtlCache<string, number>(1000);
    expect(cache.get('missing')).toBeUndefined();
  });

  it('returns cached value within TTL', () => {
    const cache = new TtlCache<string, number>(5000);
    cache.set('key', 42);
    vi.advanceTimersByTime(4999);
    expect(cache.get('key')).toBe(42);
  });

  it('expires entries after TTL', () => {
    const cache = new TtlCache<string, number>(1000);
    cache.set('key', 42);
    vi.advanceTimersByTime(1001);
    expect(cache.get('key')).toBeUndefined();
  });

  it('has() returns true for live entries', () => {
    const cache = new TtlCache<string, string>(5000);
    cache.set('x', 'hello');
    expect(cache.has('x')).toBe(true);
  });

  it('has() returns false for expired entries', () => {
    const cache = new TtlCache<string, string>(100);
    cache.set('x', 'hello');
    vi.advanceTimersByTime(200);
    expect(cache.has('x')).toBe(false);
  });

  it('size() reflects stored entries', () => {
    const cache = new TtlCache<number, string>(5000);
    expect(cache.size()).toBe(0);
    cache.set(1, 'a');
    cache.set(2, 'b');
    expect(cache.size()).toBe(2);
  });
});

describe('getOrFetch', () => {
  it('calls fetcher on cache miss and caches result', async () => {
    const cache = new TtlCache<string, number>(5000);
    const inFlight = new Map<string, Promise<number>>();
    const fetcher = vi.fn().mockResolvedValue(99);

    const result = await getOrFetch(cache, inFlight, 'k', fetcher);

    expect(result).toBe(99);
    expect(fetcher).toHaveBeenCalledOnce();
  });

  it('does not call fetcher on cache hit', async () => {
    const cache = new TtlCache<string, number>(5000);
    const inFlight = new Map<string, Promise<number>>();
    const fetcher = vi.fn().mockResolvedValue(99);

    await getOrFetch(cache, inFlight, 'k', fetcher);
    const second = await getOrFetch(cache, inFlight, 'k', fetcher);

    expect(second).toBe(99);
    expect(fetcher).toHaveBeenCalledOnce();
  });

  it('deduplicates concurrent calls for the same key', async () => {
    const cache = new TtlCache<string, number>(60_000);
    const inFlight = new Map<string, Promise<number>>();
    const fetcher = vi.fn().mockResolvedValue(42);

    const [a, b] = await Promise.all([
      getOrFetch(cache, inFlight, 'k', fetcher),
      getOrFetch(cache, inFlight, 'k', fetcher),
    ]);

    expect(a).toBe(42);
    expect(b).toBe(42);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});
