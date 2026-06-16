import { vi, describe, it, expect } from 'vitest';

// Mock heavy infrastructure so config.ts can be imported without a real DB or OAuth app.
vi.mock('@/infrastructure/db/client', () => ({
  getDb: vi.fn().mockReturnValue({}),
}));

vi.mock('@/infrastructure/db/env', () => ({
  getEnv: vi.fn().mockReturnValue({
    DATABASE_URL: 'postgres://test',
    AUTH_SECRET: 'test-secret',
    AUTH_GITHUB_ID: 'gh-test-id',
    AUTH_GITHUB_SECRET: 'gh-test-secret',
  }),
  resetEnv: vi.fn(),
}));

vi.mock('@auth/drizzle-adapter', () => ({
  DrizzleAdapter: vi.fn().mockReturnValue({}),
}));

vi.mock('next-auth/providers/github', () => ({
  default: vi.fn(({ clientId }: { clientId: string }) => ({ id: 'github', clientId })),
}));

vi.mock('@/infrastructure/db/schema', () => ({
  users: {},
  accounts: {},
  sessions: {},
  verificationTokens: {},
}));

import { getAuthOptions } from '@/infrastructure/auth/config';

describe('getAuthOptions', () => {
  it('creates auth options on first call', () => {
    const opts = getAuthOptions();
    expect(opts).toBeDefined();
    expect(opts.session).toEqual({ strategy: 'database' });
  });

  it('returns the same cached instance on subsequent calls', () => {
    const first = getAuthOptions();
    const second = getAuthOptions();
    expect(second).toBe(first);
  });
});
