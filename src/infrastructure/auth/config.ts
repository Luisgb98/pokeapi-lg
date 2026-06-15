import type { NextAuthOptions, DefaultSession } from 'next-auth';
import GitHub from 'next-auth/providers/github';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { getDb } from '../db/client';
import { accounts, sessions, users, verificationTokens } from '../db/schema';
import { getEnv } from '../db/env';

declare module 'next-auth' {
  interface Session {
    user: { id: string } & DefaultSession['user'];
  }
}

let _authOptions: NextAuthOptions | null = null;

/** Lazy singleton — defers getDb()/getEnv() until first request so Next.js build succeeds without env vars. */
export function getAuthOptions(): NextAuthOptions {
  if (_authOptions) return _authOptions;
  const env = getEnv();
  _authOptions = {
    adapter: DrizzleAdapter(getDb(), {
      usersTable: users,
      accountsTable: accounts,
      sessionsTable: sessions,
      verificationTokensTable: verificationTokens,
    }),
    providers: [
      GitHub({
        clientId: env.AUTH_GITHUB_ID,
        clientSecret: env.AUTH_GITHUB_SECRET,
      }),
    ],
    session: { strategy: 'database' },
    callbacks: {
      session({ session, user }) {
        session.user.id = user.id;
        return session;
      },
    },
  };
  return _authOptions;
}
