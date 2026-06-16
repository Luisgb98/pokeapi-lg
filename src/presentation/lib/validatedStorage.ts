import type { z } from 'zod';
import type { StateStorage } from 'zustand/middleware';

/**
 * Wraps a StateStorage so that hydration only succeeds when the persisted
 * payload's `state` field matches the given schema. Invalid or corrupted
 * payloads behave as if nothing was persisted (returns null → store falls
 * back to initial state).
 */
export function withValidation(storage: StateStorage, stateSchema: z.ZodType): StateStorage {
  return {
    getItem: (name) => {
      const raw = storage.getItem(name);
      if (raw === null || raw instanceof Promise) return raw;
      try {
        const parsed: unknown = JSON.parse(raw as string);
        const state = (parsed as { state?: unknown })?.state;
        return stateSchema.safeParse(state).success ? raw : null;
      } catch {
        return null;
      }
    },
    setItem: (name, value) => storage.setItem(name, value),
    removeItem: (name) => storage.removeItem(name),
  };
}
