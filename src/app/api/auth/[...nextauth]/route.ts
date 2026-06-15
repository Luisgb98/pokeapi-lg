import NextAuth from 'next-auth';
// eslint-disable-next-line no-restricted-imports -- auth route handler must wire directly to authOptions
import { authOptions } from '@/infrastructure/auth/config';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
