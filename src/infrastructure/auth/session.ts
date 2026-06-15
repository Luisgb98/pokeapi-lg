import { getServerSession as _getServerSession } from 'next-auth';
import { getAuthOptions } from './config';

/** Server-side session accessor for server actions and RSC. Returns null when unauthenticated. */
export function getServerSession() {
  return _getServerSession(getAuthOptions());
}
