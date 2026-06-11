export function buildTeamUrl(teamIds: number[], locale: string): string {
  if (teamIds.length === 0) return `/${locale}/team`;
  const base = typeof window !== 'undefined' ? window.location.origin : '';
  return `${base}/${locale}/team?team=${teamIds.join(',')}`;
}

export function parseTeamParam(param: string | undefined): number[] {
  if (!param) return [];
  return param
    .split(',')
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isInteger(n) && n > 0 && n <= 1025)
    .slice(0, 6);
}
