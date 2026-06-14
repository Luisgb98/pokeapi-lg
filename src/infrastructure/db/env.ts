import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  AUTH_SECRET: z.string().min(1, 'AUTH_SECRET is required'),
  AUTH_GITHUB_ID: z.string().min(1, 'AUTH_GITHUB_ID is required'),
  AUTH_GITHUB_SECRET: z.string().min(1, 'AUTH_GITHUB_SECRET is required'),
});

function validateEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const missing = result.error.issues.map((i) => i.message).join(', ');
    throw new Error(`Missing required environment variables: ${missing}`);
  }
  return result.data;
}

export type Env = z.infer<typeof envSchema>;

let _env: Env | null = null;

/** Returns validated env vars. Throws on first call if any are missing. */
export function getEnv(): Env {
  if (!_env) {
    _env = validateEnv();
  }
  return _env;
}

/** For testing: reset cached env. */
export function resetEnv(): void {
  _env = null;
}
