import { describe, expect, it } from 'vitest';
import { buildTeamUrl, parseTeamParam } from '../../../presentation/lib/teamShare';

describe('buildTeamUrl', () => {
  it('includes ?team param with comma-separated ids', () => {
    const url = buildTeamUrl([25, 1, 4], 'en');
    expect(url).toMatch(/\?team=25,1,4$/);
  });

  it('returns path with no ?team when ids is empty', () => {
    const url = buildTeamUrl([], 'en');
    expect(url).not.toContain('?team');
    expect(url).toMatch(/\/en\/team$/);
  });

  it('includes locale in path', () => {
    const url = buildTeamUrl([7], 'de');
    expect(url).toContain('/de/team');
  });
});

describe('parseTeamParam', () => {
  it('parses comma-separated ids', () => {
    expect(parseTeamParam('25,1,4')).toEqual([25, 1, 4]);
  });

  it('returns empty array for undefined', () => {
    expect(parseTeamParam(undefined)).toEqual([]);
  });

  it('returns empty array for empty string', () => {
    expect(parseTeamParam('')).toEqual([]);
  });

  it('filters out non-positive and out-of-range ids', () => {
    expect(parseTeamParam('0,25,-1,1026,4')).toEqual([25, 4]);
  });

  it('trims to 6 ids', () => {
    expect(parseTeamParam('1,2,3,4,5,6,7')).toHaveLength(6);
  });

  it('filters non-numeric entries', () => {
    expect(parseTeamParam('25,abc,4')).toEqual([25, 4]);
  });
});
