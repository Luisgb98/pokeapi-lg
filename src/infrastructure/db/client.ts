import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { getEnv } from './env';
import * as schema from './schema';

function createClient() {
  const { DATABASE_URL } = getEnv();
  const sql = neon(DATABASE_URL);
  return drizzle(sql, { schema });
}

let _db: ReturnType<typeof createClient> | null = null;

export function getDb() {
  if (!_db) {
    _db = createClient();
  }
  return _db;
}

export type Db = ReturnType<typeof getDb>;
