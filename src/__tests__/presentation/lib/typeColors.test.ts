import { describe, expect, it } from 'vitest';
import { TYPE_CLASSES, getPrimaryTypeClasses } from '../../../presentation/lib/typeColors';
import { POKEMON_TYPES } from '../../../domain/entities/Pokemon';

describe('TYPE_CLASSES', () => {
  it('has exactly 18 entries', () => {
    expect(Object.keys(TYPE_CLASSES)).toHaveLength(18);
  });

  it('covers every type in POKEMON_TYPES', () => {
    for (const type of POKEMON_TYPES) {
      expect(TYPE_CLASSES).toHaveProperty(type);
    }
  });

  it('every entry has all 6 required keys', () => {
    const requiredKeys = ['badgeBg', 'badgeText', 'badgeBorder', 'accentBg', 'tintBg', 'gradientBg'];
    for (const type of POKEMON_TYPES) {
      for (const key of requiredKeys) {
        expect(TYPE_CLASSES[type]).toHaveProperty(key);
      }
    }
  });

  it('every class value is a non-empty string', () => {
    for (const type of POKEMON_TYPES) {
      const entry = TYPE_CLASSES[type];
      for (const value of Object.values(entry)) {
        expect(typeof value).toBe('string');
        expect(value.length).toBeGreaterThan(0);
      }
    }
  });
});

describe('getPrimaryTypeClasses', () => {
  it('returns the entry for a single type', () => {
    expect(getPrimaryTypeClasses(['fire'])).toEqual(TYPE_CLASSES['fire']);
  });

  it('returns the entry for the first type when multiple types are provided', () => {
    expect(getPrimaryTypeClasses(['fire', 'flying'])).toEqual(TYPE_CLASSES['fire']);
  });

  it('returns the normal entry when called with an empty array', () => {
    expect(getPrimaryTypeClasses([])).toEqual(TYPE_CLASSES['normal']);
  });
});
