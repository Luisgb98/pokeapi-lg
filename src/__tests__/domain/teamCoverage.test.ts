import { describe, expect, it } from 'vitest';
import { computeTeamCoverage, getTypeChart } from '@/domain/entities/typeChart';

describe('computeTeamCoverage', () => {
  describe('empty team', () => {
    it('returns 18 entries with all counts at zero', () => {
      const result = computeTeamCoverage([]);
      expect(result).toHaveLength(18);
      for (const entry of result) {
        expect(entry.x4Count).toBe(0);
        expect(entry.x2Count).toBe(0);
        expect(entry.neutralCount).toBe(0);
        expect(entry.halfCount).toBe(0);
        expect(entry.quarterCount).toBe(0);
        expect(entry.immuneCount).toBe(0);
      }
    });
  });

  describe('single member', () => {
    it('counts weaknesses correctly for a Fire-type member', () => {
      const result = computeTeamCoverage([['fire']]);
      const waterEntry = result.find((e) => e.attackingType === 'water');
      expect(waterEntry?.x2Count).toBe(1);

      const rockEntry = result.find((e) => e.attackingType === 'rock');
      expect(rockEntry?.x2Count).toBe(1);

      const groundEntry = result.find((e) => e.attackingType === 'ground');
      expect(groundEntry?.x2Count).toBe(1);
    });

    it('counts resistances for a Fire-type member', () => {
      const result = computeTeamCoverage([['fire']]);
      const fireResistEntry = result.find((e) => e.attackingType === 'fire');
      expect(fireResistEntry?.halfCount).toBe(1);
    });

    it('counts immunity correctly for Normal-type (immune to Ghost)', () => {
      const result = computeTeamCoverage([['normal']]);
      const ghostEntry = result.find((e) => e.attackingType === 'ghost');
      expect(ghostEntry?.immuneCount).toBe(1);
      expect(ghostEntry?.x2Count).toBe(0);
    });
  });

  describe('multiple members', () => {
    it('accumulates weak counts across team members', () => {
      // Rock is super effective against Fire (2x) and Flying (2x)
      const result = computeTeamCoverage([['fire'], ['flying']]);
      const rockEntry = result.find((e) => e.attackingType === 'rock');
      expect(rockEntry?.x2Count).toBe(2);
    });

    it('counts x4 weakness correctly for dual-type member', () => {
      const result = computeTeamCoverage([['fire', 'flying']]);
      const rockEntry = result.find((e) => e.attackingType === 'rock');
      expect(rockEntry?.x4Count).toBe(1);
      expect(rockEntry?.x2Count).toBe(0);
    });

    it('each member counted in exactly one bucket per type', () => {
      const result = computeTeamCoverage([['fire'], ['water'], ['grass']]);
      for (const entry of result) {
        const total =
          entry.x4Count +
          entry.x2Count +
          entry.neutralCount +
          entry.halfCount +
          entry.quarterCount +
          entry.immuneCount;
        expect(total).toBe(3);
      }
    });

    it('full 6-member team sums to 6 per entry', () => {
      const team = [['fire'], ['water'], ['grass'], ['electric'], ['psychic'], ['dragon']] as const;
      const result = computeTeamCoverage(team);
      for (const entry of result) {
        const total =
          entry.x4Count +
          entry.x2Count +
          entry.neutralCount +
          entry.halfCount +
          entry.quarterCount +
          entry.immuneCount;
        expect(total).toBe(6);
      }
    });

    it('Ghost-type member is immune to Normal attacks', () => {
      const result = computeTeamCoverage([['fire'], ['ghost']]);
      const normalEntry = result.find((e) => e.attackingType === 'normal');
      expect(normalEntry?.immuneCount).toBe(1);
      expect(normalEntry?.neutralCount).toBe(1);
    });
  });

  describe('output structure', () => {
    it('returns an entry for every Pokemon type', () => {
      const result = computeTeamCoverage([['fire']]);
      const types = result.map((e) => e.attackingType);
      expect(types).toContain('normal');
      expect(types).toContain('fire');
      expect(types).toContain('fairy');
      expect(types).toHaveLength(18);
    });
  });
});

describe('getTypeChart', () => {
  it('returns a record with 18 attacking types', () => {
    const chart = getTypeChart();
    expect(Object.keys(chart)).toHaveLength(18);
  });

  it('fire is super effective against grass (2)', () => {
    const chart = getTypeChart();
    expect(chart.fire.grass).toBe(2);
  });

  it('water is not very effective against water (0.5)', () => {
    const chart = getTypeChart();
    expect(chart.water.water).toBe(0.5);
  });

  it('electric has no effect on ground (0)', () => {
    const chart = getTypeChart();
    expect(chart.electric.ground).toBe(0);
  });

  it('dragon has no effect on fairy (0) — Gen 6 rule', () => {
    const chart = getTypeChart();
    expect(chart.dragon.fairy).toBe(0);
  });
});
