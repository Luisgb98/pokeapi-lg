import { describe, expect, it } from 'vitest';
import { computeDefensiveMatchups } from '@/domain/entities/typeChart';

describe('computeDefensiveMatchups', () => {
  describe('single type', () => {
    it('returns correct weaknesses for Fire', () => {
      const matchups = computeDefensiveMatchups(['fire']);
      expect(matchups.x2).toEqual(expect.arrayContaining(['water', 'ground', 'rock']));
      expect(matchups.half).toEqual(
        expect.arrayContaining(['fire', 'grass', 'ice', 'bug', 'steel', 'fairy']),
      );
      expect(matchups.immune).toEqual([]);
      expect(matchups.x4).toEqual([]);
      expect(matchups.quarter).toEqual([]);
    });

    it('Electric is weak to Ground (not immune — only Electric moves cannot hit Ground)', () => {
      const matchups = computeDefensiveMatchups(['electric']);
      expect(matchups.x2).toContain('ground');
      expect(matchups.immune).toEqual([]);
    });

    it('returns Ghost immunity for Normal', () => {
      const matchups = computeDefensiveMatchups(['normal']);
      expect(matchups.immune).toContain('ghost');
      expect(matchups.x2).toContain('fighting');
    });

    it('returns correct matchups for Ghost', () => {
      const matchups = computeDefensiveMatchups(['ghost']);
      expect(matchups.immune).toContain('normal');
      expect(matchups.immune).toContain('fighting');
      expect(matchups.x2).toContain('ghost');
      expect(matchups.x2).toContain('dark');
    });
  });

  describe('dual types', () => {
    it('Charizard (Fire/Flying) has ×4 weakness to Rock', () => {
      const matchups = computeDefensiveMatchups(['fire', 'flying']);
      expect(matchups.x4).toContain('rock');
    });

    it('Charizard (Fire/Flying) is immune to Ground', () => {
      const matchups = computeDefensiveMatchups(['fire', 'flying']);
      expect(matchups.immune).toContain('ground');
    });

    it('Gengar (Ghost/Poison) is immune to Normal and Fighting', () => {
      const matchups = computeDefensiveMatchups(['ghost', 'poison']);
      expect(matchups.immune).toContain('normal');
      expect(matchups.immune).toContain('fighting');
    });

    it('Bulbasaur (Grass/Poison): Psychic is 2× (not 4×) in Gen 6+', () => {
      // Psychic: 1× vs Grass, 2× vs Poison → combined 2×
      const matchups = computeDefensiveMatchups(['grass', 'poison']);
      expect(matchups.x2).toContain('psychic');
      expect(matchups.x4).toEqual([]);
    });

    it('Magnemite (Electric/Steel) resists Grass by half and is immune to Poison', () => {
      // Grass: 1× vs Electric, 0.5× vs Steel → 0.5× combined (half, not quarter)
      const matchups = computeDefensiveMatchups(['electric', 'steel']);
      expect(matchups.half).toContain('grass');
      expect(matchups.immune).toContain('poison');
    });

    it('Bug/Ghost is immune to Normal and Fighting', () => {
      const matchups = computeDefensiveMatchups(['bug', 'ghost']);
      // Normal: 0 (ghost) × 1 (bug) = 0
      expect(matchups.immune).toContain('normal');
      // Fighting: 0 (ghost) × 0.5 (bug) = 0
      expect(matchups.immune).toContain('fighting');
    });

    it('Dragon/Ghost is immune to Normal and Fighting', () => {
      const matchups = computeDefensiveMatchups(['dragon', 'ghost']);
      expect(matchups.immune).toContain('normal');
      expect(matchups.immune).toContain('fighting');
      expect(matchups.x2).toContain('dragon');
    });
  });

  describe('output structure', () => {
    it('returns all five bucket keys', () => {
      const matchups = computeDefensiveMatchups(['water']);
      expect(matchups).toHaveProperty('x4');
      expect(matchups).toHaveProperty('x2');
      expect(matchups).toHaveProperty('half');
      expect(matchups).toHaveProperty('quarter');
      expect(matchups).toHaveProperty('immune');
    });

    it('no type appears in more than one bucket', () => {
      const matchups = computeDefensiveMatchups(['fire', 'water']);
      const all = [
        ...matchups.x4,
        ...matchups.x2,
        ...matchups.half,
        ...matchups.quarter,
        ...matchups.immune,
      ];
      expect(new Set(all).size).toBe(all.length);
    });
  });

  describe('Gen 6+ corrections', () => {
    it('Dark is not resisted by Steel', () => {
      const matchups = computeDefensiveMatchups(['steel']);
      expect(matchups.half).not.toContain('dark');
      expect(matchups.quarter).not.toContain('dark');
    });

    it('Ghost is not resisted by Steel', () => {
      const matchups = computeDefensiveMatchups(['steel']);
      expect(matchups.half).not.toContain('ghost');
      expect(matchups.quarter).not.toContain('ghost');
    });

    it('Dragon is immune against Fairy', () => {
      const matchups = computeDefensiveMatchups(['fairy']);
      expect(matchups.immune).toContain('dragon');
    });
  });
});
