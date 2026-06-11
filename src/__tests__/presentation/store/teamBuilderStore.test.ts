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
