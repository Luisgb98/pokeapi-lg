import type { Config } from 'drizzle-kit';

// Load .env.local for drizzle-kit CLI commands (next dev handles this automatically)
try {
  // Node 20.12+ built-in — no dotenv package needed
  (process as NodeJS.Process & { loadEnvFile?: (path: string) => void }).loadEnvFile?.(
    '.env.local',
  );
} catch {}

export default {
  dialect: 'postgresql',
  schema: './src/infrastructure/db/schema.ts',
  out: './src/infrastructure/db/migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
