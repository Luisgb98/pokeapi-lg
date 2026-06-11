import { describe, expect, it } from 'vitest';
import { POKEMON_TYPES } from '../../domain/entities/Pokemon';
import { calculateDefenseEffectiveness } from '../../domain/usecases/calculateTypeEffectiveness';

describe('calculateDefenseEffectiveness', () => {
  it('single Fire: 2× to Water, 0.5× to Grass, 1× to Normal', () => {
    const r = calculateDefenseEffectiveness(['fire']);
    expect(r.water).toBe(2);
    expect(r.grass).toBe(0.5);
    expect(r.normal).toBe(1);
  });

  it('dual Fire/Flying: 4× to Rock, 0× to Ground', () => {
    const r = calculateDefenseEffectiveness(['fire', 'flying']);
    expect(r.rock).toBe(4);
    expect(r.ground).toBe(0);
  });

  it('returns a numeric result for all 18 attack types', () => {
    const r = calculateDefenseEffectiveness(['water']);
    for (const t of POKEMON_TYPES) {
      expect(typeof r[t]).toBe('number');
    }
  });

  it('does not throw for any single-type input', () => {
    for (const t of POKEMON_TYPES) {
      expect(() => calculateDefenseEffectiveness([t])).not.toThrow();
    }
  });

  it('does not throw for any dual-type input', () => {
    for (const t1 of POKEMON_TYPES) {
      for (const t2 of POKEMON_TYPES) {
        if (t1 !== t2) {
          expect(() => calculateDefenseEffectiveness([t1, t2])).not.toThrow();
        }
      }
    }
  });

  it('single Ghost: immune to Normal and Fighting', () => {
    const r = calculateDefenseEffectiveness(['ghost']);
    expect(r.normal).toBe(0);
    expect(r.fighting).toBe(0);
  });

  it('dual Steel/Rock: immune to Poison, 2× to Water, 4× to Ground', () => {
    const r = calculateDefenseEffectiveness(['steel', 'rock']);
    expect(r.poison).toBe(0);
    expect(r.water).toBe(2);
    expect(r.ground).toBe(4);
  });
});
