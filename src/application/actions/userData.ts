'use server';

import { z } from 'zod';
import { getServerSession } from '@/infrastructure/auth/session';
import { getUserDataRepository } from '../container';
import type { SavedTeam } from '@/domain/entities/SavedTeam';
import type { SavedComparison } from '@/domain/entities/SavedComparison';

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

async function requireUserId(): Promise<string | null> {
  const session = await getServerSession();
  return session?.user?.id ?? null;
}

// ---------------------------------------------------------------------------
// Zod schemas — all inputs are `unknown` because they come from the client
// ---------------------------------------------------------------------------

const pokemonIdSchema = z.number().int().positive();

const teamMemberSchema = z.object({
  slot: z.number().int().min(0).max(5),
  pokemonId: z.number().int().positive(),
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
  const ids = await getUserDataRepository().getFavorites(userId);
  return ok(ids);
}

export async function toggleFavoriteAction(
  rawPokemonId: unknown,
): Promise<ActionResult<{ id: number; on: boolean }>> {
  const userId = await requireUserId();
  if (!userId) return unauthenticated();

  const parsed = pokemonIdSchema.safeParse(rawPokemonId);
  if (!parsed.success) return err('Invalid pokemonId');
  const pokemonId = parsed.data;
  const repo = getUserDataRepository();
  const current = await repo.getFavorites(userId);
  const on = !current.includes(pokemonId);
  await repo.setFavorite(userId, pokemonId, on);
  return ok({ id: pokemonId, on });
}

// ---------------------------------------------------------------------------
// Teams
// ---------------------------------------------------------------------------

export async function listTeamsAction(): Promise<ActionResult<readonly SavedTeam[]>> {
  const userId = await requireUserId();
  if (!userId) return unauthenticated();
  const teams = await getUserDataRepository().listTeams(userId);
  return ok(teams);
}

export async function saveTeamAction(rawInput: unknown): Promise<ActionResult<SavedTeam>> {
  const userId = await requireUserId();
  if (!userId) return unauthenticated();

  const parsed = saveTeamInputSchema.safeParse(rawInput);
  if (!parsed.success) return err('Invalid team input');
  const team = await getUserDataRepository().saveTeam(userId, parsed.data);
  return ok(team);
}

export async function deleteTeamAction(rawTeamId: unknown): Promise<ActionResult<void>> {
  const userId = await requireUserId();
  if (!userId) return unauthenticated();

  const parsed = uuidSchema.safeParse(rawTeamId);
  if (!parsed.success) return err('Invalid teamId');
  await getUserDataRepository().deleteTeam(userId, parsed.data);
  return ok(undefined);
}

// ---------------------------------------------------------------------------
// Comparisons
// ---------------------------------------------------------------------------

export async function listComparisonsAction(): Promise<ActionResult<readonly SavedComparison[]>> {
  const userId = await requireUserId();
  if (!userId) return unauthenticated();
  const comparisons = await getUserDataRepository().listComparisons(userId);
  return ok(comparisons);
}

export async function saveComparisonAction(
  rawInput: unknown,
): Promise<ActionResult<SavedComparison>> {
  const userId = await requireUserId();
  if (!userId) return unauthenticated();

  const parsed = saveComparisonInputSchema.safeParse(rawInput);
  if (!parsed.success) return err('Invalid comparison input');
  const comparison = await getUserDataRepository().saveComparison(userId, parsed.data);
  return ok(comparison);
}

export async function deleteComparisonAction(rawId: unknown): Promise<ActionResult<void>> {
  const userId = await requireUserId();
  if (!userId) return unauthenticated();

  const parsed = uuidSchema.safeParse(rawId);
  if (!parsed.success) return err('Invalid id');
  await getUserDataRepository().deleteComparison(userId, parsed.data);
  return ok(undefined);
}
