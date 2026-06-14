import { describe, it, expect } from 'vitest';
import { NATURES, getNature } from '@/domain/data/natures';
import type { NatureStat } from '@/domain/data/natures';

describe('NATURES table', () => {
  it('contains exactly 25 natures', () => {
    expect(NATURES).toHaveLength(25);
  });

  it('has exactly 5 neutral natures (both fields null)', () => {
    const neutral = NATURES.filter((n) => n.increased === null && n.decreased === null);
    expect(neutral).toHaveLength(5);
  });

  it('every non-neutral nature has increased !== decreased', () => {
    const nonNeutral = NATURES.filter((n) => n.increased !== null && n.decreased !== null);
    for (const nature of nonNeutral) {
      expect(nature.increased).not.toEqual(nature.decreased);
    }
  });

  it('each of the 5 stats appears exactly 4 times as increased', () => {
    const stats: NatureStat[] = ['attack', 'defense', 'specialAttack', 'specialDefense', 'speed'];
    for (const stat of stats) {
      const count = NATURES.filter((n) => n.increased === stat).length;
      expect(count, `${stat} increased count`).toBe(4);
    }
  });

  it('each of the 5 stats appears exactly 4 times as decreased', () => {
    const stats: NatureStat[] = ['attack', 'defense', 'specialAttack', 'specialDefense', 'speed'];
    for (const stat of stats) {
      const count = NATURES.filter((n) => n.decreased === stat).length;
      expect(count, `${stat} decreased count`).toBe(4);
    }
  });

  it('all 25 natures have unique names', () => {
    const names = NATURES.map((n) => n.name);
    const unique = new Set(names);
    expect(unique.size).toBe(25);
  });
});

describe('getNature', () => {
  it('returns adamant with +attack −specialAttack', () => {
    const nature = getNature('adamant');
    expect(nature).toBeDefined();
    expect(nature!.increased).toBe('attack');
    expect(nature!.decreased).toBe('specialAttack');
  });

  it('returns modest with +specialAttack −attack', () => {
    const nature = getNature('modest');
    expect(nature).toBeDefined();
    expect(nature!.increased).toBe('specialAttack');
    expect(nature!.decreased).toBe('attack');
  });

  it('returns jolly with +speed −specialAttack', () => {
    const nature = getNature('jolly');
    expect(nature).toBeDefined();
    expect(nature!.increased).toBe('speed');
    expect(nature!.decreased).toBe('specialAttack');
  });

  it('returns hardy as neutral', () => {
    const nature = getNature('hardy');
    expect(nature).toBeDefined();
    expect(nature!.increased).toBeNull();
    expect(nature!.decreased).toBeNull();
  });

  it('returns undefined for unknown nature', () => {
    expect(getNature('unknown-nature')).toBeUndefined();
  });
});
