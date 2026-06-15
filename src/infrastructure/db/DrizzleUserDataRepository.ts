import { and, eq } from 'drizzle-orm';
import type {
  UserDataRepository,
  NewTeamInput,
  NewComparisonInput,
} from '../../domain/ports/UserDataRepository';
import type { SavedTeam } from '../../domain/entities/SavedTeam';
import type { SavedComparison } from '../../domain/entities/SavedComparison';
import type { Db } from './client';
import { comparisons, favorites, teamMembers, teams } from './schema';

export class DrizzleUserDataRepository implements UserDataRepository {
  constructor(private readonly db: Db) {}

  async getFavorites(userId: string): Promise<readonly number[]> {
    const rows = await this.db
      .select({ pokemonId: favorites.pokemonId })
      .from(favorites)
      .where(eq(favorites.userId, userId));
    return rows.map((r) => r.pokemonId);
  }

  async setFavorite(userId: string, pokemonId: number, on: boolean): Promise<void> {
    if (on) {
      await this.db.insert(favorites).values({ userId, pokemonId }).onConflictDoNothing();
    } else {
      await this.db
        .delete(favorites)
        .where(and(eq(favorites.userId, userId), eq(favorites.pokemonId, pokemonId)));
    }
  }

  async listTeams(userId: string): Promise<readonly SavedTeam[]> {
    const rows = await this.db.query.teams.findMany({
      where: eq(teams.userId, userId),
      with: { members: true },
      orderBy: (t, { desc }) => [desc(t.updatedAt)],
    });
    return rows.map(toSavedTeam);
  }

  async getTeam(userId: string, teamId: string): Promise<SavedTeam | null> {
    const row = await this.db.query.teams.findFirst({
      where: and(eq(teams.id, teamId), eq(teams.userId, userId)),
      with: { members: true },
    });
    return row ? toSavedTeam(row) : null;
  }

  async saveTeam(userId: string, input: NewTeamInput & { id?: string }): Promise<SavedTeam> {
    return this.db.transaction(async (tx) => {
      const now = new Date();

      const [team] = input.id
        ? await tx
            .update(teams)
            .set({ name: input.name, updatedAt: now })
            .where(and(eq(teams.id, input.id), eq(teams.userId, userId)))
            .returning()
        : await tx.insert(teams).values({ userId, name: input.name, updatedAt: now }).returning();

      if (!team) throw new Error('Team not found or unauthorized');

      await tx.delete(teamMembers).where(eq(teamMembers.teamId, team.id));

      if (input.members.length > 0) {
        await tx.insert(teamMembers).values(
          input.members.map((m) => ({
            teamId: team.id,
            slot: m.slot,
            pokemonId: m.pokemonId,
          })),
        );
      }

      const members = await tx.select().from(teamMembers).where(eq(teamMembers.teamId, team.id));

      return toSavedTeam({ ...team, members });
    });
  }

  async deleteTeam(userId: string, teamId: string): Promise<void> {
    await this.db.delete(teams).where(and(eq(teams.id, teamId), eq(teams.userId, userId)));
  }

  async listComparisons(userId: string): Promise<readonly SavedComparison[]> {
    const rows = await this.db
      .select()
      .from(comparisons)
      .where(eq(comparisons.userId, userId))
      .orderBy(comparisons.createdAt);
    return rows.map(toSavedComparison);
  }

  async saveComparison(
    userId: string,
    input: NewComparisonInput & { id?: string },
  ): Promise<SavedComparison> {
    const values = {
      userId,
      name: input.name ?? null,
      slotA: input.slotA ?? null,
      slotB: input.slotB ?? null,
      slotC: input.slotC ?? null,
    };

    const rows = input.id
      ? await this.db
          .update(comparisons)
          .set(values)
          .where(and(eq(comparisons.id, input.id), eq(comparisons.userId, userId)))
          .returning()
      : await this.db.insert(comparisons).values(values).returning();

    if (!rows[0]) throw new Error('Comparison not found or unauthorized');
    return toSavedComparison(rows[0]);
  }

  async deleteComparison(userId: string, comparisonId: string): Promise<void> {
    await this.db
      .delete(comparisons)
      .where(and(eq(comparisons.id, comparisonId), eq(comparisons.userId, userId)));
  }
}

// ---------------------------------------------------------------------------
// Mappers — convert DB row shapes to domain entities
// ---------------------------------------------------------------------------

type TeamRow = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  members: Array<{ slot: number; pokemonId: number }>;
};

function toSavedTeam(row: TeamRow): SavedTeam {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    members: row.members
      .map((m) => ({ slot: m.slot, pokemonId: m.pokemonId }))
      .sort((a, b) => a.slot - b.slot),
  };
}

type ComparisonRow = {
  id: string;
  name: string | null;
  slotA: number | null;
  slotB: number | null;
  slotC: number | null;
  createdAt: Date;
};

function toSavedComparison(row: ComparisonRow): SavedComparison {
  return {
    id: row.id,
    name: row.name,
    slotA: row.slotA,
    slotB: row.slotB,
    slotC: row.slotC,
    createdAt: row.createdAt,
  };
}
