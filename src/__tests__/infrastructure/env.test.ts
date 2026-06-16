import { describe, it, expect, afterEach, vi } from 'vitest';
import { getEnv, resetEnv } from '@/infrastructure/db/env';

const VALID_ENV = {
  DATABASE_URL: 'postgres://test:pass@localhost/testdb',
  AUTH_SECRET: 'test-secret-value',
  AUTH_GITHUB_ID: 'gh-client-id',
  AUTH_GITHUB_SECRET: 'gh-client-secret',
};

function stubValidEnv() {
  for (const [key, value] of Object.entries(VALID_ENV)) {
    vi.stubEnv(key, value);
  }
}

afterEach(() => {
  vi.unstubAllEnvs();
  resetEnv();
});

describe('getEnv', () => {
  it('returns validated env vars when all required vars are present', () => {
    stubValidEnv();
    const env = getEnv();
    expect(env.DATABASE_URL).toBe(VALID_ENV.DATABASE_URL);
    expect(env.AUTH_SECRET).toBe(VALID_ENV.AUTH_SECRET);
    expect(env.AUTH_GITHUB_ID).toBe(VALID_ENV.AUTH_GITHUB_ID);
    expect(env.AUTH_GITHUB_SECRET).toBe(VALID_ENV.AUTH_GITHUB_SECRET);
  });

  it('returns the same singleton on repeated calls', () => {
    stubValidEnv();
    expect(getEnv()).toBe(getEnv());
  });

  it('throws when DATABASE_URL is missing', () => {
    stubValidEnv();
    vi.stubEnv('DATABASE_URL', '');
    expect(() => getEnv()).toThrow('DATABASE_URL is required');
  });

  it('throws when AUTH_SECRET is missing', () => {
    stubValidEnv();
    vi.stubEnv('AUTH_SECRET', '');
    expect(() => getEnv()).toThrow('AUTH_SECRET is required');
  });

  it('accepts NEXTAUTH_URL when set to a valid URL', () => {
    stubValidEnv();
    vi.stubEnv('NEXTAUTH_URL', 'http://localhost:3000');
    const env = getEnv();
    expect(env.NEXTAUTH_URL).toBe('http://localhost:3000');
  });

  it('leaves NEXTAUTH_URL undefined when not set', () => {
    stubValidEnv();
    const env = getEnv();
    expect(env.NEXTAUTH_URL).toBeUndefined();
  });
});

describe('resetEnv', () => {
  it('clears the cache so the next getEnv call re-validates', () => {
    stubValidEnv();
    const a = getEnv();
    resetEnv();
    const b = getEnv();
    expect(b).not.toBe(a);
    expect(b).toStrictEqual(a);
  });
});
