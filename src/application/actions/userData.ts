'use server';

import { z } from 'zod';
import { getUserDataRepository, getSession } from '../container';
import type { SavedTeam } from '@/domain/entities/SavedTeam';
import type { SavedComparison } from '@/domain/entities/SavedComparison';
import { checkRateLimit } from '../lib/rateLimiter';

// ---------------------------------------------------------------------------
// Response envelope — consistent with the rest of the app's ApiResponse shape
// ---------------------------------------------------------------------------

type Ok<T> = { success: true; data: T };
type Err = { success: false; error: string };
type ActionResult<T> = Ok<T> | Err;

function ok<T>(data: T): Ok<T> {
  return { success: true, data };
}

function err(message: string): Err {
  return { success: false, error: message };
}

function unauthenticated(): Err {
  return err('Unauthenticated');
}

function rateLimited(): Err {
  return err('Too many requests');
}

async function requireUserId(): Promise<string | null> {
  const session = await getSession();
  return session?.user?.id ?? null;
}

function mapRepoError(e: unknown): Err {
  const msg = e instanceof Error ? e.message : '';
  if (msg.includes('not found or unauthorized')) return err('Not found');
  return err('Something went wrong');
}

// ---------------------------------------------------------------------------
// Zod schemas — all inputs are `unknown` because they come from the client
// ---------------------------------------------------------------------------

const pokemonIdSchema = z.number().int().positive();

const pokemonStatsSchema = z.object({
  hp: z.number().int().min(0).max(255),
  attack: z.number().int().min(0).max(255),
  defense: z.number().int().min(0).max(255),
  specialAttack: z.number().int().min(0).max(255),
  specialDefense: z.number().int().min(0).max(255),
  speed: z.number().int().min(0).max(255),
});

const teamMemberBuildSchema = z.object({
  abilityName: z.string().min(1).max(100),
  natureName: z.string().min(1).max(50),
  level: z.number().int().min(1).max(100),
  ivs: pokemonStatsSchema,
  evs: pokemonStatsSchema,
  moveNames: z.array(z.string().min(1).max(100)).max(4),
});

const teamMemberSchema = z.object({
  slot: z.number().int().min(0).max(5),
  pokemonId: z.number().int().positive(),
  build: teamMemberBuildSchema.optional(),
});

const saveTeamInputSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(100),
  members: z.array(teamMemberSchema).min(1).max(6),
});

const uuidSchema = z.string().uuid();

const saveComparisonInputSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().max(100).optional().nullable(),
  slotA: z.number().int().positive().optional().nullable(),
  slotB: z.number().int().positive().optional().nullable(),
  slotC: z.number().int().positive().optional().nullable(),
});

// ---------------------------------------------------------------------------
// Favorites
// ---------------------------------------------------------------------------

export async function getFavoritesAction(): Promise<ActionResult<readonly number[]>> {
  const userId = await requireUserId();
  if (!userId) return unauthenticated();
  try {
    const ids = await getUserDataRepository().getFavorites(userId);
    return ok(ids);
  } catch (e: unknown) {
    console.error('[userData] getFavoritesAction error:', e);
    return mapRepoError(e);
  }
}

export async function toggleFavoriteAction(
  rawPokemonId: unknown,
): Promise<ActionResult<{ id: number; on: boolean }>> {
  const userId = await requireUserId();
  if (!userId) return unauthenticated();
  if (!checkRateLimit(userId)) return rateLimited();

  const parsed = pokemonIdSchema.safeParse(rawPokemonId);
  if (!parsed.success) return err('Invalid pokemonId');
  const pokemonId = parsed.data;

  try {
    const repo = getUserDataRepository();
    const current = await repo.getFavorites(userId);
    const on = !current.includes(pokemonId);
    await repo.setFavorite(userId, pokemonId, on);
    return ok({ id: pokemonId, on });
  } catch (e: unknown) {
    console.error('[userData] toggleFavoriteAction error:', e);
    return mapRepoError(e);
  }
}

// ---------------------------------------------------------------------------
// Teams
// ---------------------------------------------------------------------------

export async function listTeamsAction(): Promise<ActionResult<readonly SavedTeam[]>> {
  const userId = await requireUserId();
  if (!userId) return unauthenticated();
  try {
    const teams = await getUserDataRepository().listTeams(userId);
    return ok(teams);
  } catch (e: unknown) {
    console.error('[userData] listTeamsAction error:', e);
    return mapRepoError(e);
  }
}

export async function saveTeamAction(rawInput: unknown): Promise<ActionResult<SavedTeam>> {
  const userId = await requireUserId();
  if (!userId) return unauthenticated();
  if (!checkRateLimit(userId)) return rateLimited();

  const parsed = saveTeamInputSchema.safeParse(rawInput);
  if (!parsed.success) return err('Invalid team input');

  try {
    const team = await getUserDataRepository().saveTeam(userId, parsed.data);
    return ok(team);
  } catch (e: unknown) {
    console.error('[userData] saveTeamAction error:', e);
    return mapRepoError(e);
  }
}

export async function deleteTeamAction(rawTeamId: unknown): Promise<ActionResult<void>> {
  const userId = await requireUserId();
  if (!userId) return unauthenticated();
  if (!checkRateLimit(userId)) return rateLimited();

  const parsed = uuidSchema.safeParse(rawTeamId);
  if (!parsed.success) return err('Invalid teamId');

  try {
    await getUserDataRepository().deleteTeam(userId, parsed.data);
    return ok(undefined);
  } catch (e: unknown) {
    console.error('[userData] deleteTeamAction error:', e);
    return mapRepoError(e);
  }
}

// ---------------------------------------------------------------------------
// Comparisons
// ---------------------------------------------------------------------------

export async function listComparisonsAction(): Promise<ActionResult<readonly SavedComparison[]>> {
  const userId = await requireUserId();
  if (!userId) return unauthenticated();
  try {
    const comparisons = await getUserDataRepository().listComparisons(userId);
    return ok(comparisons);
  } catch (e: unknown) {
    console.error('[userData] listComparisonsAction error:', e);
    return mapRepoError(e);
  }
}

export async function saveComparisonAction(
  rawInput: unknown,
): Promise<ActionResult<SavedComparison>> {
  const userId = await requireUserId();
  if (!userId) return unauthenticated();
  if (!checkRateLimit(userId)) return rateLimited();

  const parsed = saveComparisonInputSchema.safeParse(rawInput);
  if (!parsed.success) return err('Invalid comparison input');

  try {
    const comparison = await getUserDataRepository().saveComparison(userId, parsed.data);
    return ok(comparison);
  } catch (e: unknown) {
    console.error('[userData] saveComparisonAction error:', e);
    return mapRepoError(e);
  }
}

export async function deleteComparisonAction(rawId: unknown): Promise<ActionResult<void>> {
  const userId = await requireUserId();
  if (!userId) return unauthenticated();
  if (!checkRateLimit(userId)) return rateLimited();

  const parsed = uuidSchema.safeParse(rawId);
  if (!parsed.success) return err('Invalid id');

  try {
    await getUserDataRepository().deleteComparison(userId, parsed.data);
    return ok(undefined);
  } catch (e: unknown) {
    console.error('[userData] deleteComparisonAction error:', e);
    return mapRepoError(e);
  }
}
