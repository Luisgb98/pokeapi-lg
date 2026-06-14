import type { SavedComparison } from '../entities/SavedComparison';
import type { SavedTeam } from '../entities/SavedTeam';

export type { SavedTeam, SavedTeamMember } from '../entities/SavedTeam';
export type { SavedComparison } from '../entities/SavedComparison';

export interface NewTeamInput {
  readonly name: string;
  readonly members: ReadonlyArray<{ readonly slot: number; readonly pokemonId: number }>;
}

export interface NewComparisonInput {
  readonly name?: string | null;
  readonly slotA?: number | null;
  readonly slotB?: number | null;
  readonly slotC?: number | null;
}

export interface UserDataRepository {
  /** Returns the pokemonIds the user has favorited. */
  getFavorites(userId: string): Promise<readonly number[]>;

  /** Adds (on=true) or removes (on=false) a pokémon from favorites. */
  setFavorite(userId: string, pokemonId: number, on: boolean): Promise<void>;

  /** Lists all teams belonging to the user. */
  listTeams(userId: string): Promise<readonly SavedTeam[]>;

  /** Returns a single team, or null if it does not belong to the user. */
  getTeam(userId: string, teamId: string): Promise<SavedTeam | null>;

  /** Creates or replaces a team. Returns the persisted team. */
  saveTeam(userId: string, team: NewTeamInput & { id?: string }): Promise<SavedTeam>;

  /** Deletes a team. No-ops if it does not belong to the user. */
  deleteTeam(userId: string, teamId: string): Promise<void>;

  /** Lists all saved comparisons for the user. */
  listComparisons(userId: string): Promise<readonly SavedComparison[]>;

  /** Creates or updates a comparison. Returns the persisted comparison. */
  saveComparison(
    userId: string,
    comparison: NewComparisonInput & { id?: string },
  ): Promise<SavedComparison>;

  /** Deletes a comparison. No-ops if it does not belong to the user. */
  deleteComparison(userId: string, comparisonId: string): Promise<void>;
}
