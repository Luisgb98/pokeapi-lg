import { describe, expect, it } from 'vitest';
import { computeOffensiveCoverage } from '@/domain/entities/typeChart';

describe('computeOffensiveCoverage', () => {
  describe('empty team', () => {
    it('returns 18 entries with all values at zero', () => {
      const result = computeOffensiveCoverage([]);
      expect(result).toHaveLength(18);
      for (const entry of result) {
        expect(entry.bestMultiplier).toBe(0);
        expect(entry.superEffectiveCount).toBe(0);
      }
    });
  });

  describe('single-type member', () => {
    it('water vs fire → bestMultiplier 2, count 1', () => {
      const result = computeOffensiveCoverage([['water']]);
      const entry = result.find((e) => e.defendingType === 'fire');
      expect(entry?.bestMultiplier).toBe(2);
      expect(entry?.superEffectiveCount).toBe(1);
    });

    it('water vs water → bestMultiplier 0.5, count 0', () => {
      const result = computeOffensiveCoverage([['water']]);
      const entry = result.find((e) => e.defendingType === 'water');
      expect(entry?.bestMultiplier).toBe(0.5);
      expect(entry?.superEffectiveCount).toBe(0);
    });

    it('normal vs ghost → bestMultiplier 0 (immune), count 0', () => {
      const result = computeOffensiveCoverage([['normal']]);
      const entry = result.find((e) => e.defendingType === 'ghost');
      expect(entry?.bestMultiplier).toBe(0);
      expect(entry?.superEffectiveCount).toBe(0);
    });
  });

  describe('dual-type member', () => {
    it('water+ground vs fire → bestMultiplier 2, count 1 (one member)', () => {
      const result = computeOffensiveCoverage([['water', 'ground']]);
      const entry = result.find((e) => e.defendingType === 'fire');
      expect(entry?.bestMultiplier).toBe(2);
      expect(entry?.superEffectiveCount).toBe(1);
    });
  });

  describe('multiple members', () => {
    it('fire+water vs grass → bestMultiplier 2, superEffectiveCount 1', () => {
      const result = computeOffensiveCoverage([['fire'], ['water']]);
      const entry = result.find((e) => e.defendingType === 'grass');
      // fire hits grass 2x; water hits grass 0.5x → best is 2, only fire member counts
      expect(entry?.bestMultiplier).toBe(2);
      expect(entry?.superEffectiveCount).toBe(1);
    });
  });

  describe('normal-type team', () => {
    it('normal hits nothing super-effectively', () => {
      const result = computeOffensiveCoverage([['normal']]);
      for (const entry of result) {
        expect(entry.superEffectiveCount).toBe(0);
      }
    });
  });

  describe('output structure', () => {
    it('returns an entry for every Pokemon type', () => {
      const result = computeOffensiveCoverage([['fire']]);
      const types = result.map((e) => e.defendingType);
      expect(types).toContain('normal');
      expect(types).toContain('fire');
      expect(types).toContain('fairy');
      expect(types).toHaveLength(18);
    });
  });
});
