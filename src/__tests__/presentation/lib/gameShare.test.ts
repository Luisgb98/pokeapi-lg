import { describe, expect, it } from 'vitest';
import { buildShareUrl, buildShareText } from '../../../presentation/lib/gameShare';

describe('buildShareUrl', () => {
  it('returns a URL with result, total, and day params', () => {
    const url = buildShareUrl(7, 10, 20261231, 'en');
    expect(url).toContain('/en/game');
    expect(url).toContain('result=7');
    expect(url).toContain('total=10');
    expect(url).toContain('day=20261231');
  });

  it('includes locale in the path', () => {
    expect(buildShareUrl(5, 10, 1000, 'de')).toContain('/de/game');
    expect(buildShareUrl(5, 10, 1000, 'es')).toContain('/es/game');
  });

  it('produces a score of 0 correctly', () => {
    const url = buildShareUrl(0, 10, 1, 'pt');
    expect(url).toContain('result=0');
  });

  it('produces a perfect score correctly', () => {
    const url = buildShareUrl(10, 10, 1, 'it');
    expect(url).toContain('result=10');
    expect(url).toContain('total=10');
  });
});

describe('buildShareText', () => {
  it('starts with the game title and score', () => {
    const text = buildShareText(5, 10);
    expect(text).toMatch(/^Who's That Pokémon\? 5\/10/);
  });

  it('uses ✅ for correct rounds and ❌ for wrong ones', () => {
    const text = buildShareText(3, 5);
    expect(text).toContain('✅✅✅❌❌');
  });

  it('produces all ✅ for a perfect score', () => {
    const text = buildShareText(10, 10);
    expect(text).toContain('✅✅✅✅✅✅✅✅✅✅');
    expect(text).not.toContain('❌');
  });

  it('produces all ❌ for a zero score', () => {
    const text = buildShareText(0, 5);
    expect(text).toContain('❌❌❌❌❌');
    expect(text).not.toContain('✅');
  });

  it('separates the title line from the grid with a newline', () => {
    const text = buildShareText(2, 4);
    const lines = text.split('\n');
    expect(lines).toHaveLength(2);
    expect(lines[0]).toBe("Who's That Pokémon? 2/4");
    expect(lines[1]).toBe('✅✅❌❌');
  });
});
