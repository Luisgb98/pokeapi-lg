export function buildShareUrl(score: number, total: number, day: number, locale: string): string {
  const base = typeof window !== 'undefined' ? window.location.origin : '';
  return `${base}/${locale}/game?result=${score}&total=${total}&day=${day}`;
}

export function buildShareText(score: number, total: number): string {
  const grid = Array.from({ length: total }, (_, i) => (i < score ? '✅' : '❌')).join('');
  return `Who's That Pokémon? ${score}/${total}\n${grid}`;
}
