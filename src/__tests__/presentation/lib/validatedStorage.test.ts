import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import type { StateStorage } from 'zustand/middleware';
import { withValidation } from '../../../presentation/lib/validatedStorage';

function memoryStorage(initial: Record<string, string> = {}): StateStorage {
  const store = new Map<string, string>(Object.entries(initial));
  return {
    getItem: (name) => store.get(name) ?? null,
    setItem: (name, value) => store.set(name, value),
    removeItem: (name) => store.delete(name),
  };
}

const teamSchema = z.object({ team: z.array(z.object({ id: z.number() })) });

describe('withValidation', () => {
  it('passes through a valid envelope unchanged', () => {
    const raw = JSON.stringify({ state: { team: [{ id: 1 }] }, version: 0 });
    const storage = memoryStorage({ key: raw });
    const validated = withValidation(storage, teamSchema);
    expect(validated.getItem('key')).toBe(raw);
  });

  it('returns null for malformed JSON', () => {
    const storage = memoryStorage({ key: 'not-json{' });
    const validated = withValidation(storage, teamSchema);
    expect(validated.getItem('key')).toBeNull();
  });

  it('returns null when state shape does not match schema', () => {
    const raw = JSON.stringify({ state: { team: 'nope' }, version: 0 });
    const storage = memoryStorage({ key: raw });
    const validated = withValidation(storage, teamSchema);
    expect(validated.getItem('key')).toBeNull();
  });

  it('returns null when key does not exist', () => {
    const storage = memoryStorage();
    const validated = withValidation(storage, teamSchema);
    expect(validated.getItem('missing')).toBeNull();
  });

  it('delegates setItem to the wrapped storage', () => {
    const inner = memoryStorage();
    const validated = withValidation(inner, teamSchema);
    const raw = JSON.stringify({ state: { team: [] }, version: 0 });
    validated.setItem('key', raw);
    expect(inner.getItem('key')).toBe(raw);
  });

  it('delegates removeItem to the wrapped storage', () => {
    const raw = JSON.stringify({ state: { team: [] }, version: 0 });
    const inner = memoryStorage({ key: raw });
    const validated = withValidation(inner, teamSchema);
    validated.removeItem('key');
    expect(inner.getItem('key')).toBeNull();
  });
});
