import { describe, it, expect, beforeEach } from 'vitest';
import type {
  UserDataRepository,
  NewTeamInput,
  NewComparisonInput,
} from '@/domain/ports/UserDataRepository';
import type { SavedTeam } from '@/domain/entities/SavedTeam';
import type { SavedComparison } from '@/domain/entities/SavedComparison';

// ---------------------------------------------------------------------------
// In-memory fake — exercises the port contract without a real DB
// ---------------------------------------------------------------------------

class FakeUserDataRepository implements UserDataRepository {
  private favs = new Map<string, Set<number>>();
  private teams = new Map<string, SavedTeam & { userId: string }>();
  private comps = new Map<string, SavedComparison & { userId: string }>();

  async getFavorites(userId: string) {
    return Array.from(this.favs.get(userId) ?? []);
  }

  async setFavorite(userId: string, pokemonId: number, on: boolean) {
    if (!this.favs.has(userId)) this.favs.set(userId, new Set());
    if (on) this.favs.get(userId)!.add(pokemonId);
    else this.favs.get(userId)!.delete(pokemonId);
  }

  async listTeams(userId: string) {
    return Array.from(this.teams.values())
      .filter((t) => t.userId === userId)
      .map(({ userId: _u, ...t }) => t);
  }

  async getTeam(userId: string, teamId: string) {
    const t = this.teams.get(teamId);
    if (!t || t.userId !== userId) return null;
    const { userId: _u, ...team } = t;
    return team;
  }

  async saveTeam(userId: string, input: NewTeamInput & { id?: string }) {
    const id = input.id ?? crypto.randomUUID();
    const now = new Date();
    const team: SavedTeam & { userId: string } = {
      id,
      userId,
      name: input.name,
      members: [...input.members].sort((a, b) => a.slot - b.slot),
      createdAt: this.teams.get(id)?.createdAt ?? now,
      updatedAt: now,
    };
    this.teams.set(id, team);
    const { userId: _u, ...result } = team;
    return result;
  }

  async deleteTeam(userId: string, teamId: string) {
    const t = this.teams.get(teamId);
    if (t?.userId === userId) this.teams.delete(teamId);
  }

  async listComparisons(userId: string) {
    return Array.from(this.comps.values())
      .filter((c) => c.userId === userId)
      .map(({ userId: _u, ...c }) => c);
  }

  async saveComparison(userId: string, input: NewComparisonInput & { id?: string }) {
    const id = input.id ?? crypto.randomUUID();
    const comp: SavedComparison & { userId: string } = {
      id,
      userId,
      name: input.name ?? null,
      slotA: input.slotA ?? null,
      slotB: input.slotB ?? null,
      slotC: input.slotC ?? null,
      createdAt: this.comps.get(id)?.createdAt ?? new Date(),
    };
    this.comps.set(id, comp);
    const { userId: _u, ...result } = comp;
    return result;
  }

  async deleteComparison(userId: string, comparisonId: string) {
    const c = this.comps.get(comparisonId);
    if (c?.userId === userId) this.comps.delete(comparisonId);
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('UserDataRepository contract', () => {
  let repo: UserDataRepository;
  const USER_A = 'user-a';
  const USER_B = 'user-b';

  beforeEach(() => {
    repo = new FakeUserDataRepository();
  });

  describe('favorites', () => {
    it('starts empty', async () => {
      expect(await repo.getFavorites(USER_A)).toEqual([]);
    });

    it('adds a favorite', async () => {
      await repo.setFavorite(USER_A, 25, true);
      expect(await repo.getFavorites(USER_A)).toContain(25);
    });

    it('removes a favorite', async () => {
      await repo.setFavorite(USER_A, 25, true);
      await repo.setFavorite(USER_A, 25, false);
      expect(await repo.getFavorites(USER_A)).not.toContain(25);
    });

    it('is isolated per user', async () => {
      await repo.setFavorite(USER_A, 25, true);
      expect(await repo.getFavorites(USER_B)).toEqual([]);
    });
  });

  describe('teams', () => {
    const input: NewTeamInput = {
      name: 'My Team',
      members: [
        { slot: 0, pokemonId: 1 },
        { slot: 1, pokemonId: 4 },
      ],
    };

    it('creates a team', async () => {
      const team = await repo.saveTeam(USER_A, input);
      expect(team.name).toBe('My Team');
      expect(team.members).toHaveLength(2);
    });

    it('retrieves a team by id', async () => {
      const created = await repo.saveTeam(USER_A, input);
      const fetched = await repo.getTeam(USER_A, created.id);
      expect(fetched?.id).toBe(created.id);
    });

    it("returns null for another user's team", async () => {
      const created = await repo.saveTeam(USER_A, input);
      expect(await repo.getTeam(USER_B, created.id)).toBeNull();
    });

    it('updates an existing team', async () => {
      const created = await repo.saveTeam(USER_A, input);
      const updated = await repo.saveTeam(USER_A, { ...input, id: created.id, name: 'Renamed' });
      expect(updated.name).toBe('Renamed');
      expect(updated.id).toBe(created.id);
    });

    it("lists only the user's teams", async () => {
      await repo.saveTeam(USER_A, input);
      await repo.saveTeam(USER_B, { ...input, name: 'B Team' });
      const teams = await repo.listTeams(USER_A);
      expect(teams).toHaveLength(1);
      expect(teams[0].name).toBe('My Team');
    });

    it('deletes a team', async () => {
      const created = await repo.saveTeam(USER_A, input);
      await repo.deleteTeam(USER_A, created.id);
      expect(await repo.listTeams(USER_A)).toHaveLength(0);
    });

    it("cannot delete another user's team", async () => {
      const created = await repo.saveTeam(USER_A, input);
      await repo.deleteTeam(USER_B, created.id);
      expect(await repo.listTeams(USER_A)).toHaveLength(1);
    });

    it('members are sorted by slot', async () => {
      const team = await repo.saveTeam(USER_A, {
        name: 'T',
        members: [
          { slot: 2, pokemonId: 7 },
          { slot: 0, pokemonId: 1 },
        ],
      });
      expect(team.members[0].slot).toBe(0);
      expect(team.members[1].slot).toBe(2);
    });
  });

  describe('comparisons', () => {
    const input: NewComparisonInput = { slotA: 1, slotB: 4, slotC: 7 };

    it('creates a comparison', async () => {
      const c = await repo.saveComparison(USER_A, input);
      expect(c.slotA).toBe(1);
      expect(c.slotB).toBe(4);
      expect(c.slotC).toBe(7);
    });

    it('is isolated per user', async () => {
      await repo.saveComparison(USER_A, input);
      expect(await repo.listComparisons(USER_B)).toHaveLength(0);
    });

    it('updates an existing comparison', async () => {
      const c = await repo.saveComparison(USER_A, input);
      const updated = await repo.saveComparison(USER_A, { id: c.id, slotA: 25 });
      expect(updated.slotA).toBe(25);
      expect(updated.id).toBe(c.id);
    });

    it('deletes a comparison', async () => {
      const c = await repo.saveComparison(USER_A, input);
      await repo.deleteComparison(USER_A, c.id);
      expect(await repo.listComparisons(USER_A)).toHaveLength(0);
    });

    it("cannot delete another user's comparison", async () => {
      const c = await repo.saveComparison(USER_A, input);
      await repo.deleteComparison(USER_B, c.id);
      expect(await repo.listComparisons(USER_A)).toHaveLength(1);
    });
  });
});
