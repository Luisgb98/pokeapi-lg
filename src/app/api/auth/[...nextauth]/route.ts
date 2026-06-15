import NextAuth from 'next-auth';
// eslint-disable-next-line no-restricted-imports -- auth route handler must wire directly to getAuthOptions
import { getAuthOptions } from '@/infrastructure/auth/config';

// Handler created lazily (not at module level) so Next.js build succeeds without env vars.
let _handler: ReturnType<typeof NextAuth> | null = null;
const getHandler = () => (_handler ??= NextAuth(getAuthOptions()));

export const GET = (...args: Parameters<ReturnType<typeof NextAuth>>) => getHandler()(...args);
export const POST = (...args: Parameters<ReturnType<typeof NextAuth>>) => getHandler()(...args);
