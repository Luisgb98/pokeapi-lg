import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mocks must be declared before imports that depend on them.
vi.mock('@/infrastructure/auth/session', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('@/application/lib/rateLimiter', () => ({
  checkRateLimit: vi.fn(() => true),
  resetRateLimiter: vi.fn(),
}));

import { getServerSession } from '@/infrastructure/auth/session';
import { checkRateLimit } from '@/application/lib/rateLimiter';
import { setUserDataRepository, resetUserDataRepository } from '@/application/container';
import type { UserDataRepository } from '@/domain/ports/UserDataRepository';
import type { SavedTeam } from '@/domain/entities/SavedTeam';
import type { SavedComparison } from '@/domain/entities/SavedComparison';
import {
  getFavoritesAction,
  toggleFavoriteAction,
  saveTeamAction,
  deleteTeamAction,
  listTeamsAction,
  saveComparisonAction,
  deleteComparisonAction,
  listComparisonsAction,
} from '@/application/actions/userData';

const mockSession = vi.mocked(getServerSession);
const mockRateLimit = vi.mocked(checkRateLimit);

const NOW = new Date();
const TEAM_ID = '00000000-0000-4000-8000-000000000001';
const COMP_ID = '00000000-0000-4000-8000-000000000002';

const fakeTeam: SavedTeam = {
  id: TEAM_ID,
  name: 'Test Team',
  members: [{ slot: 0, pokemonId: 25 }],
  createdAt: NOW,
  updatedAt: NOW,
};

const fakeComparison: SavedComparison = {
  id: COMP_ID,
  name: null,
  slotA: 1,
  slotB: 4,
  slotC: null,
  createdAt: NOW,
};

function makeRepo(overrides: Partial<UserDataRepository> = {}): UserDataRepository {
  return {
    getFavorites: vi.fn().mockResolvedValue([1, 25, 150]),
    setFavorite: vi.fn().mockResolvedValue(undefined),
    listTeams: vi.fn().mockResolvedValue([fakeTeam]),
    getTeam: vi.fn().mockResolvedValue(fakeTeam),
    saveTeam: vi.fn().mockResolvedValue(fakeTeam),
    deleteTeam: vi.fn().mockResolvedValue(undefined),
    listComparisons: vi.fn().mockResolvedValue([fakeComparison]),
    saveComparison: vi.fn().mockResolvedValue(fakeComparison),
    deleteComparison: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function asAuthenticated(userId = 'user-123') {
  mockSession.mockResolvedValue({
    user: { id: userId },
  } as Awaited<ReturnType<typeof getServerSession>>);
}

function asUnauthenticated() {
  mockSession.mockResolvedValue(null);
}

beforeEach(() => {
  mockRateLimit.mockReturnValue(true);
  asAuthenticated();
  setUserDataRepository(makeRepo());
});

afterEach(() => {
  resetUserDataRepository();
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Auth guard
// ---------------------------------------------------------------------------

describe('auth guard', () => {
  it('returns Unauthenticated when no session', async () => {
    asUnauthenticated();
    const result = await getFavoritesAction();
    expect(result).toEqual({ success: false, error: 'Unauthenticated' });
  });
});

// ---------------------------------------------------------------------------
// Rate limiting
// ---------------------------------------------------------------------------

describe('rate limiting on mutating actions', () => {
  beforeEach(() => mockRateLimit.mockReturnValue(false));

  it('toggleFavoriteAction returns Too many requests', async () => {
    expect(await toggleFavoriteAction(25)).toEqual({ success: false, error: 'Too many requests' });
  });

  it('saveTeamAction returns Too many requests', async () => {
    expect(await saveTeamAction({ name: 'Team', members: [{ slot: 0, pokemonId: 1 }] })).toEqual({
      success: false,
      error: 'Too many requests',
    });
  });

  it('deleteTeamAction returns Too many requests', async () => {
    expect(await deleteTeamAction(TEAM_ID)).toEqual({
      success: false,
      error: 'Too many requests',
    });
  });

  it('saveComparisonAction returns Too many requests', async () => {
    expect(await saveComparisonAction({ slotA: 1 })).toEqual({
      success: false,
      error: 'Too many requests',
    });
  });

  it('deleteComparisonAction returns Too many requests', async () => {
    expect(await deleteComparisonAction(COMP_ID)).toEqual({
      success: false,
      error: 'Too many requests',
    });
  });
});

// ---------------------------------------------------------------------------
// Error envelope — repo throws are caught and wrapped
// ---------------------------------------------------------------------------

describe('error envelope', () => {
  it('getFavoritesAction wraps generic repo error', async () => {
    setUserDataRepository(
      makeRepo({ getFavorites: vi.fn().mockRejectedValue(new Error('DB down')) }),
    );
    expect(await getFavoritesAction()).toEqual({ success: false, error: 'Something went wrong' });
  });

  it('saveTeamAction maps "not found or unauthorized" to Not found', async () => {
    setUserDataRepository(
      makeRepo({
        saveTeam: vi.fn().mockRejectedValue(new Error('Team not found or unauthorized')),
      }),
    );
    expect(await saveTeamAction({ name: 'T', members: [{ slot: 0, pokemonId: 1 }] })).toEqual({
      success: false,
      error: 'Not found',
    });
  });

  it('deleteTeamAction wraps generic repo error', async () => {
    setUserDataRepository(
      makeRepo({ deleteTeam: vi.fn().mockRejectedValue(new Error('DB error')) }),
    );
    expect(await deleteTeamAction(TEAM_ID)).toEqual({
      success: false,
      error: 'Something went wrong',
    });
  });

  it('deleteComparisonAction maps "not found or unauthorized" to Not found', async () => {
    setUserDataRepository(
      makeRepo({
        deleteComparison: vi
          .fn()
          .mockRejectedValue(new Error('Comparison not found or unauthorized')),
      }),
    );
    expect(await deleteComparisonAction(COMP_ID)).toEqual({
      success: false,
      error: 'Not found',
    });
  });

  it('saveComparisonAction wraps generic repo error', async () => {
    setUserDataRepository(
      makeRepo({ saveComparison: vi.fn().mockRejectedValue(new Error('DB down')) }),
    );
    expect(await saveComparisonAction({ slotA: 1 })).toEqual({
      success: false,
      error: 'Something went wrong',
    });
  });
});

// ---------------------------------------------------------------------------
// Input validation
// ---------------------------------------------------------------------------

describe('input validation', () => {
  it('toggleFavoriteAction rejects non-positive pokemonId', async () => {
    expect(await toggleFavoriteAction(-1)).toEqual({ success: false, error: 'Invalid pokemonId' });
  });

  it('saveTeamAction rejects empty name', async () => {
    expect(await saveTeamAction({ name: '', members: [{ slot: 0, pokemonId: 1 }] })).toEqual({
      success: false,
      error: 'Invalid team input',
    });
  });

  it('saveTeamAction rejects member with invalid build level', async () => {
    expect(
      await saveTeamAction({
        name: 'Team',
        members: [
          {
            slot: 0,
            pokemonId: 1,
            build: {
              abilityName: 'x',
              natureName: 'hardy',
              level: 200,
              ivs: {
                hp: 31,
                attack: 31,
                defense: 31,
                specialAttack: 31,
                specialDefense: 31,
                speed: 31,
              },
              evs: { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 },
              moveNames: [],
            },
          },
        ],
      }),
    ).toEqual({ success: false, error: 'Invalid team input' });
  });

  it('saveComparisonAction rejects invalid input', async () => {
    expect(await saveComparisonAction({ name: 'x'.repeat(200) })).toEqual({
      success: false,
      error: 'Invalid comparison input',
    });
  });

  it('deleteTeamAction rejects non-UUID', async () => {
    expect(await deleteTeamAction('not-a-uuid')).toEqual({
      success: false,
      error: 'Invalid teamId',
    });
  });

  it('deleteComparisonAction rejects non-UUID raw value', async () => {
    expect(await deleteComparisonAction(42)).toEqual({ success: false, error: 'Invalid id' });
  });
});

// ---------------------------------------------------------------------------
// Happy paths
// ---------------------------------------------------------------------------

describe('happy paths', () => {
  it('getFavoritesAction returns favorites list', async () => {
    expect(await getFavoritesAction()).toEqual({ success: true, data: [1, 25, 150] });
  });

  it('toggleFavoriteAction returns toggled state (25 is in list → on=false)', async () => {
    const result = await toggleFavoriteAction(25);
    expect(result).toMatchObject({ success: true, data: { id: 25, on: false } });
  });

  it('listTeamsAction returns teams', async () => {
    expect(await listTeamsAction()).toEqual({ success: true, data: [fakeTeam] });
  });

  it('saveTeamAction returns saved team', async () => {
    expect(
      await saveTeamAction({ name: 'Test Team', members: [{ slot: 0, pokemonId: 25 }] }),
    ).toEqual({ success: true, data: fakeTeam });
  });

  it('deleteTeamAction returns ok', async () => {
    expect(await deleteTeamAction(TEAM_ID)).toEqual({ success: true, data: undefined });
  });

  it('listComparisonsAction returns comparisons', async () => {
    expect(await listComparisonsAction()).toEqual({ success: true, data: [fakeComparison] });
  });

  it('saveComparisonAction returns saved comparison', async () => {
    expect(await saveComparisonAction({ slotA: 1, slotB: 4 })).toEqual({
      success: true,
      data: fakeComparison,
    });
  });

  it('deleteComparisonAction returns ok', async () => {
    expect(await deleteComparisonAction(COMP_ID)).toEqual({
      success: true,
      data: undefined,
    });
  });
});
