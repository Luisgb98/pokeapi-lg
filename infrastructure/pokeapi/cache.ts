interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

/** Simple TTL cache. Server-singleton, survives across requests. */
export class TtlCache<K, V> {
  private readonly store = new Map<K, CacheEntry<V>>();

  constructor(private readonly ttlMs: number) {}

  get(key: K): V | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key: K, value: V): void {
    this.store.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }

  has(key: K): boolean {
    return this.get(key) !== undefined;
  }

  size(): number {
    return this.store.size;
  }
}

/** Fetches value once (or if expired), then caches it. */
export async function getOrFetch<K, V>(
  cache: TtlCache<K, V>,
  key: K,
  fetcher: () => Promise<V>,
): Promise<V> {
  const cached = cache.get(key);
  if (cached !== undefined) return cached;
  const value = await fetcher();
  cache.set(key, value);
  return value;
}
