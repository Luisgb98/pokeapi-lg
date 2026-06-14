import { getServerSession as _getServerSession } from 'next-auth';
import { authOptions } from './config';

/** Server-side session accessor for server actions and RSC. Returns null when unauthenticated. */
export function getServerSession() {
  return _getServerSession(authOptions);
}
