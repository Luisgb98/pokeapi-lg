import { describe, it, expect } from 'vitest';
import {
  calculateHp,
  calculateStat,
  calculateAllStats,
  IV_MAX,
  EV_MAX,
  EV_TOTAL_MAX,
  LEVEL_MIN,
  LEVEL_MAX,
} from '@/domain/usecases/calculateStats';
import { getNature } from '@/domain/data/natures';

describe('constants', () => {
  it('exports correct bounds', () => {
    expect(IV_MAX).toBe(31);
    expect(EV_MAX).toBe(252);
    expect(EV_TOTAL_MAX).toBe(510);
    expect(LEVEL_MIN).toBe(1);
    expect(LEVEL_MAX).toBe(100);
  });
});

describe('calculateHp', () => {
  it('base 100, IV 31, EV 252, level 100 → 404', () => {
    expect(calculateHp(100, 31, 252, 100)).toBe(404);
  });

  it('level 1, base 45, IV 0, EV 0 → 11', () => {
    expect(calculateHp(45, 0, 0, 1)).toBe(11);
  });
});

describe('calculateStat', () => {
  it('base 100, IV 31, EV 252, level 100, neutral (×1) → 299', () => {
    expect(calculateStat(100, 31, 252, 100, 1)).toBe(299);
  });

  it('base 100, IV 31, EV 252, level 100, +10% nature → 328', () => {
    expect(calculateStat(100, 31, 252, 100, 1.1)).toBe(328);
  });

  it('base 100, IV 31, EV 252, level 100, −10% nature → 269', () => {
    expect(calculateStat(100, 31, 252, 100, 0.9)).toBe(269);
  });

  it('base 100, IV 31, EV 0, level 50, neutral → 120', () => {
    expect(calculateStat(100, 31, 0, 50, 1)).toBe(120);
  });
});

describe('calculateAllStats', () => {
  const baseStats = {
    hp: 100,
    attack: 100,
    defense: 100,
    specialAttack: 100,
    specialDefense: 100,
    speed: 100,
  };
  const fullIvs = {
    hp: 31,
    attack: 31,
    defense: 31,
    specialAttack: 31,
    specialDefense: 31,
    speed: 31,
  };
  const fullEvs = {
    hp: 252,
    attack: 252,
    defense: 252,
    specialAttack: 252,
    specialDefense: 252,
    speed: 252,
  };

  it('adamant nature raises attack and lowers specialAttack', () => {
    const adamant = getNature('adamant')!;
    const result = calculateAllStats(baseStats, fullIvs, fullEvs, 100, adamant);
    expect(result.hp).toBe(404);
    expect(result.attack).toBe(328);
    expect(result.specialAttack).toBe(269);
    expect(result.defense).toBe(299);
    expect(result.specialDefense).toBe(299);
    expect(result.speed).toBe(299);
  });

  it('hardy (neutral) applies no modifiers', () => {
    const hardy = getNature('hardy')!;
    const result = calculateAllStats(baseStats, fullIvs, fullEvs, 100, hardy);
    expect(result.hp).toBe(404);
    expect(result.attack).toBe(299);
    expect(result.defense).toBe(299);
    expect(result.specialAttack).toBe(299);
    expect(result.specialDefense).toBe(299);
    expect(result.speed).toBe(299);
  });

  it('HP is never affected by nature', () => {
    const adamant = getNature('adamant')!;
    const hardy = getNature('hardy')!;
    const adamantResult = calculateAllStats(baseStats, fullIvs, fullEvs, 100, adamant);
    const hardyResult = calculateAllStats(baseStats, fullIvs, fullEvs, 100, hardy);
    expect(adamantResult.hp).toBe(hardyResult.hp);
  });
});
