import { describe, expect, it } from 'vitest';
import { validateTeamMemberBuild } from '@/domain/usecases/validateTeamMemberBuild';
import type { TeamMemberBuild } from '@/domain/entities/TeamMemberBuild';
import {
  IV_MAX,
  EV_MAX,
  EV_TOTAL_MAX,
  LEVEL_MIN,
  LEVEL_MAX,
} from '@/domain/usecases/calculateStats';

const LEGAL_ABILITIES = ['sand-veil', 'rough-skin'];
const LEGAL_MOVES = ['earthquake', 'dragon-claw', 'fire-fang', 'swords-dance', 'crunch'];

const validBuild: TeamMemberBuild = {
  abilityName: 'sand-veil',
  natureName: 'jolly',
  level: 50,
  ivs: { hp: 31, attack: 31, defense: 31, specialAttack: 0, specialDefense: 31, speed: 31 },
  evs: { hp: 4, attack: 252, defense: 0, specialAttack: 0, specialDefense: 0, speed: 252 },
  moveNames: ['earthquake', 'dragon-claw', 'fire-fang', 'swords-dance'],
};

describe('validateTeamMemberBuild — fully legal build', () => {
  it('accepts a fully legal build', () => {
    const result = validateTeamMemberBuild(validBuild, LEGAL_ABILITIES, LEGAL_MOVES);
    expect(result.ok).toBe(true);
  });
});

describe('validateTeamMemberBuild — ability legality', () => {
  it('rejects an ability not in the legal ability list', () => {
    const build: TeamMemberBuild = { ...validBuild, abilityName: 'speed-boost' };
    const result = validateTeamMemberBuild(build, LEGAL_ABILITIES, LEGAL_MOVES);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.some((e) => e.code === 'ILLEGAL_ABILITY')).toBe(true);
  });

  it('accepts an ability that is in the legal list', () => {
    const build: TeamMemberBuild = { ...validBuild, abilityName: 'rough-skin' };
    const result = validateTeamMemberBuild(build, LEGAL_ABILITIES, LEGAL_MOVES);
    expect(result.ok).toBe(true);
  });
});

describe('validateTeamMemberBuild — nature legality', () => {
  it('rejects an unknown nature', () => {
    const build: TeamMemberBuild = { ...validBuild, natureName: 'legendary' };
    const result = validateTeamMemberBuild(build, LEGAL_ABILITIES, LEGAL_MOVES);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.some((e) => e.code === 'ILLEGAL_NATURE')).toBe(true);
  });

  it('accepts all 25 real natures', () => {
    const natures = [
      'hardy',
      'docile',
      'serious',
      'bashful',
      'quirky',
      'lonely',
      'brave',
      'adamant',
      'naughty',
      'bold',
      'relaxed',
      'impish',
      'lax',
      'timid',
      'hasty',
      'jolly',
      'naive',
      'modest',
      'mild',
      'quiet',
      'rash',
      'calm',
      'gentle',
      'sassy',
      'careful',
    ];
    for (const natureName of natures) {
      const build: TeamMemberBuild = { ...validBuild, natureName };
      const result = validateTeamMemberBuild(build, LEGAL_ABILITIES, LEGAL_MOVES);
      expect(result.ok, `Nature ${natureName} should be accepted`).toBe(true);
    }
  });
});

describe('validateTeamMemberBuild — level legality', () => {
  it(`rejects level below ${LEVEL_MIN}`, () => {
    const build: TeamMemberBuild = { ...validBuild, level: 0 };
    const result = validateTeamMemberBuild(build, LEGAL_ABILITIES, LEGAL_MOVES);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.some((e) => e.code === 'ILLEGAL_LEVEL')).toBe(true);
  });

  it(`rejects level above ${LEVEL_MAX}`, () => {
    const build: TeamMemberBuild = { ...validBuild, level: 101 };
    const result = validateTeamMemberBuild(build, LEGAL_ABILITIES, LEGAL_MOVES);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.some((e) => e.code === 'ILLEGAL_LEVEL')).toBe(true);
  });

  it(`accepts level at ${LEVEL_MIN}`, () => {
    const build: TeamMemberBuild = { ...validBuild, level: LEVEL_MIN };
    expect(validateTeamMemberBuild(build, LEGAL_ABILITIES, LEGAL_MOVES).ok).toBe(true);
  });

  it(`accepts level at ${LEVEL_MAX}`, () => {
    const build: TeamMemberBuild = { ...validBuild, level: LEVEL_MAX };
    expect(validateTeamMemberBuild(build, LEGAL_ABILITIES, LEGAL_MOVES).ok).toBe(true);
  });
});

describe('validateTeamMemberBuild — IV legality', () => {
  it(`rejects an IV above ${IV_MAX}`, () => {
    const build: TeamMemberBuild = {
      ...validBuild,
      ivs: { ...validBuild.ivs, attack: 32 },
    };
    const result = validateTeamMemberBuild(build, LEGAL_ABILITIES, LEGAL_MOVES);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.some((e) => e.code === 'ILLEGAL_IV')).toBe(true);
  });

  it('rejects a negative IV', () => {
    const build: TeamMemberBuild = {
      ...validBuild,
      ivs: { ...validBuild.ivs, speed: -1 },
    };
    const result = validateTeamMemberBuild(build, LEGAL_ABILITIES, LEGAL_MOVES);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.some((e) => e.code === 'ILLEGAL_IV')).toBe(true);
  });

  it(`accepts IVs at 0 and ${IV_MAX}`, () => {
    const build: TeamMemberBuild = {
      ...validBuild,
      ivs: {
        hp: 0,
        attack: IV_MAX,
        defense: 0,
        specialAttack: IV_MAX,
        specialDefense: 0,
        speed: IV_MAX,
      },
    };
    expect(validateTeamMemberBuild(build, LEGAL_ABILITIES, LEGAL_MOVES).ok).toBe(true);
  });
});

describe('validateTeamMemberBuild — EV legality', () => {
  it(`rejects a single EV above ${EV_MAX}`, () => {
    const build: TeamMemberBuild = {
      ...validBuild,
      evs: { ...validBuild.evs, hp: 253 },
    };
    const result = validateTeamMemberBuild(build, LEGAL_ABILITIES, LEGAL_MOVES);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.some((e) => e.code === 'ILLEGAL_EV_SINGLE')).toBe(true);
  });

  it(`rejects total EVs above ${EV_TOTAL_MAX}`, () => {
    const build: TeamMemberBuild = {
      ...validBuild,
      evs: { hp: 252, attack: 252, defense: 8, specialAttack: 0, specialDefense: 0, speed: 0 },
    };
    const result = validateTeamMemberBuild(build, LEGAL_ABILITIES, LEGAL_MOVES);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.some((e) => e.code === 'ILLEGAL_EV_TOTAL')).toBe(true);
  });

  it(`accepts total EVs exactly at ${EV_TOTAL_MAX}`, () => {
    const build: TeamMemberBuild = {
      ...validBuild,
      evs: { hp: 4, attack: 252, defense: 0, specialAttack: 0, specialDefense: 0, speed: 252 },
    };
    expect(validateTeamMemberBuild(build, LEGAL_ABILITIES, LEGAL_MOVES).ok).toBe(true);
  });

  it('rejects a negative EV', () => {
    const build: TeamMemberBuild = {
      ...validBuild,
      evs: { ...validBuild.evs, defense: -1 },
    };
    const result = validateTeamMemberBuild(build, LEGAL_ABILITIES, LEGAL_MOVES);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.some((e) => e.code === 'ILLEGAL_EV_SINGLE')).toBe(true);
  });
});

describe('validateTeamMemberBuild — move legality', () => {
  it('rejects a 5th move', () => {
    const build: TeamMemberBuild = {
      ...validBuild,
      moveNames: ['earthquake', 'dragon-claw', 'fire-fang', 'swords-dance', 'crunch'],
    };
    const result = validateTeamMemberBuild(build, LEGAL_ABILITIES, LEGAL_MOVES);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.some((e) => e.code === 'TOO_MANY_MOVES')).toBe(true);
  });

  it('rejects a duplicate move', () => {
    const build: TeamMemberBuild = {
      ...validBuild,
      moveNames: ['earthquake', 'earthquake', 'fire-fang', 'swords-dance'],
    };
    const result = validateTeamMemberBuild(build, LEGAL_ABILITIES, LEGAL_MOVES);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.some((e) => e.code === 'DUPLICATE_MOVE')).toBe(true);
  });

  it('rejects a move not in the learnset', () => {
    const build: TeamMemberBuild = {
      ...validBuild,
      moveNames: ['surf', 'dragon-claw', 'fire-fang', 'swords-dance'],
    };
    const result = validateTeamMemberBuild(build, LEGAL_ABILITIES, LEGAL_MOVES);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.some((e) => e.code === 'ILLEGAL_MOVE')).toBe(true);
  });

  it('accepts 0 moves', () => {
    const build: TeamMemberBuild = { ...validBuild, moveNames: [] };
    expect(validateTeamMemberBuild(build, LEGAL_ABILITIES, LEGAL_MOVES).ok).toBe(true);
  });

  it('accepts exactly 4 unique legal moves', () => {
    const build: TeamMemberBuild = {
      ...validBuild,
      moveNames: ['earthquake', 'dragon-claw', 'fire-fang', 'swords-dance'],
    };
    expect(validateTeamMemberBuild(build, LEGAL_ABILITIES, LEGAL_MOVES).ok).toBe(true);
  });
});
