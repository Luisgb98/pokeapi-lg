import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { TeamMember } from '@/presentation/store/teamBuilderStore';
import { TEAM_MAX_SIZE, useTeamBuilderStore } from '@/presentation/store/teamBuilderStore';

vi.mock('@/presentation/lib/cookieStorage', () => ({
  cookieStorage: { getItem: vi.fn(() => null), setItem: vi.fn(), removeItem: vi.fn() },
}));

const makeMember = (id: number): TeamMember => ({
  id,
  name: `pokemon-${id}`,
  displayName: `Pokemon ${id}`,
  types: ['normal'],
  sprite: `https://sprites.pokemon.com/${id}.png`,
});

beforeEach(() => {
  useTeamBuilderStore.setState({ team: [] });
});

describe('initial state', () => {
  it('starts with an empty team', () => {
    expect(useTeamBuilderStore.getState().team).toHaveLength(0);
  });
});

describe('addMember', () => {
  it('adds a member and team has 1 entry', () => {
    useTeamBuilderStore.getState().addMember(makeMember(25));
    expect(useTeamBuilderStore.getState().team).toHaveLength(1);
  });

  it('does not add a duplicate member', () => {
    useTeamBuilderStore.getState().addMember(makeMember(25));
    useTeamBuilderStore.getState().addMember(makeMember(25));
    expect(useTeamBuilderStore.getState().team).toHaveLength(1);
  });

  it(`ignores a 7th member when team is full (max ${TEAM_MAX_SIZE})`, () => {
    for (let i = 1; i <= TEAM_MAX_SIZE; i++) {
      useTeamBuilderStore.getState().addMember(makeMember(i));
    }
    useTeamBuilderStore.getState().addMember(makeMember(99));
    expect(useTeamBuilderStore.getState().team).toHaveLength(TEAM_MAX_SIZE);
  });
});

describe('removeMember', () => {
  it('removes a member by id', () => {
    useTeamBuilderStore.getState().addMember(makeMember(25));
    useTeamBuilderStore.getState().removeMember(25);
    expect(useTeamBuilderStore.getState().team).toHaveLength(0);
  });

  it('does not throw or change length when id is not in team', () => {
    useTeamBuilderStore.getState().addMember(makeMember(25));
    useTeamBuilderStore.getState().removeMember(999);
    expect(useTeamBuilderStore.getState().team).toHaveLength(1);
  });
});

describe('reorderTeam', () => {
  it('moves a member from one index to another', () => {
    useTeamBuilderStore.getState().addMember(makeMember(1));
    useTeamBuilderStore.getState().addMember(makeMember(2));
    useTeamBuilderStore.getState().addMember(makeMember(3));
    useTeamBuilderStore.getState().reorderTeam(0, 2);
    const ids = useTeamBuilderStore.getState().team.map((m) => m.id);
    expect(ids).toEqual([2, 3, 1]);
  });
});

describe('clear', () => {
  it('empties the team', () => {
    useTeamBuilderStore.getState().addMember(makeMember(25));
    useTeamBuilderStore.getState().addMember(makeMember(26));
    useTeamBuilderStore.getState().clear();
    expect(useTeamBuilderStore.getState().team).toHaveLength(0);
  });
});

describe('addMembers', () => {
  it('adds multiple members to an empty team in order', () => {
    useTeamBuilderStore.getState().addMembers([makeMember(1), makeMember(2), makeMember(3)]);
    const ids = useTeamBuilderStore.getState().team.map((m) => m.id);
    expect(ids).toEqual([1, 2, 3]);
  });

  it('skips members whose id is already on the team', () => {
    useTeamBuilderStore.getState().addMember(makeMember(1));
    useTeamBuilderStore.getState().addMembers([makeMember(1), makeMember(2)]);
    expect(useTeamBuilderStore.getState().team).toHaveLength(2);
    expect(useTeamBuilderStore.getState().team.map((m) => m.id)).toEqual([1, 2]);
  });

  it(`stops at TEAM_MAX_SIZE when given more than ${TEAM_MAX_SIZE} members`, () => {
    const members = Array.from({ length: 8 }, (_, i) => makeMember(i + 1));
    useTeamBuilderStore.getState().addMembers(members);
    expect(useTeamBuilderStore.getState().team).toHaveLength(TEAM_MAX_SIZE);
  });

  it('mixed: team of 4 + list with 1 duplicate and 3 new fills to 6', () => {
    for (let i = 1; i <= 4; i++) {
      useTeamBuilderStore.getState().addMember(makeMember(i));
    }
    useTeamBuilderStore
      .getState()
      .addMembers([makeMember(2), makeMember(5), makeMember(6), makeMember(7)]);
    const team = useTeamBuilderStore.getState().team;
    expect(team).toHaveLength(6);
    expect(team.filter((m) => m.id === 2)).toHaveLength(1);
  });

  it('no-op when all members are already on the team', () => {
    useTeamBuilderStore.getState().addMember(makeMember(1));
    useTeamBuilderStore.getState().addMember(makeMember(2));
    const before = useTeamBuilderStore.getState().team;
    useTeamBuilderStore.getState().addMembers([makeMember(1), makeMember(2)]);
    expect(useTeamBuilderStore.getState().team).toBe(before);
  });
});
