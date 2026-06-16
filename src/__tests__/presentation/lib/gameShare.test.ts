import { describe, expect, it } from 'vitest';
import {
  buildShareUrl,
  buildShareText,
  parseGameShareParams,
} from '../../../presentation/lib/gameShare';

describe('buildShareUrl', () => {
  it('returns a URL with result, total, and day params', () => {
    const url = buildShareUrl(7, 10, 20261231, 'en');
    expect(url).toContain('/en/game/whos-that');
    expect(url).toContain('result=7');
    expect(url).toContain('total=10');
    expect(url).toContain('day=20261231');
  });

  it('includes locale in the path', () => {
    expect(buildShareUrl(5, 10, 1000, 'de')).toContain('/de/game/whos-that');
    expect(buildShareUrl(5, 10, 1000, 'es')).toContain('/es/game/whos-that');
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

describe('parseGameShareParams', () => {
  const validDay = Math.floor(Date.now() / 86_400_000);

  it('returns parsed params for a valid share URL', () => {
    const result = parseGameShareParams({
      result: '7',
      total: '10',
      day: String(validDay),
    });
    expect(result).toEqual({ score: 7, total: 10, day: validDay });
  });

  it('returns null when result is missing', () => {
    expect(parseGameShareParams({ total: '10', day: String(validDay) })).toBeNull();
  });

  it('returns null when day is missing', () => {
    expect(parseGameShareParams({ result: '7', total: '10' })).toBeNull();
  });

  it('returns null for non-numeric result', () => {
    expect(parseGameShareParams({ result: 'abc', total: '10', day: String(validDay) })).toBeNull();
  });

  it('returns null for negative day', () => {
    expect(parseGameShareParams({ result: '5', total: '10', day: '-1' })).toBeNull();
  });

  it('returns null when day is in the future', () => {
    expect(
      parseGameShareParams({ result: '5', total: '10', day: String(validDay + 5) }),
    ).toBeNull();
  });

  it('returns null when result exceeds total', () => {
    expect(parseGameShareParams({ result: '11', total: '10', day: String(validDay) })).toBeNull();
  });

  it('defaults total to MAX_ROUNDS when omitted', () => {
    const result = parseGameShareParams({ result: '5', day: String(validDay) });
    expect(result).not.toBeNull();
    expect(result?.total).toBe(10);
  });
});
