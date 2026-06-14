import { z } from 'zod';
import { getDailySeed } from '@/application/usecases/getGameChallenge';
import { MAX_ROUNDS } from '@/presentation/store/gameStore';

export interface GameShareParams {
  readonly score: number;
  readonly total: number;
  readonly day: number;
}

const shareParamsSchema = z.object({
  result: z.coerce.number().int().min(0),
  total: z.coerce.number().int().min(1).max(MAX_ROUNDS),
  day: z.coerce.number().int().min(0),
});

/** Returns null when params are absent, malformed, or out of range. */
export function parseGameShareParams(sp: {
  result?: string;
  total?: string;
  day?: string;
}): GameShareParams | null {
  if (sp.result === undefined || sp.day === undefined) return null;
  const parsed = shareParamsSchema.safeParse({
    result: sp.result,
    total: sp.total ?? String(MAX_ROUNDS),
    day: sp.day,
  });
  if (!parsed.success) return null;
  const { result, total, day } = parsed.data;
  if (day > getDailySeed()) return null;
  if (result > total) return null;
  return { score: result, total, day };
}

export function buildShareUrl(score: number, total: number, day: number, locale: string): string {
  const base = typeof window !== 'undefined' ? window.location.origin : '';
  return `${base}/${locale}/game/whos-that?result=${score}&total=${total}&day=${day}`;
}

export function buildShareText(score: number, total: number): string {
  const grid = Array.from({ length: total }, (_, i) => (i < score ? '✅' : '❌')).join('');
  return `Who's That Pokémon? ${score}/${total}\n${grid}`;
}
