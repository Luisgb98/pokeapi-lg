import type { PokemonStats } from '../entities/Pokemon';
import type { Nature } from '../data/natures';

export const IV_MAX = 31;
export const EV_MAX = 252;
export const EV_TOTAL_MAX = 510;
export const LEVEL_MIN = 1;
export const LEVEL_MAX = 100;

export function calculateHp(base: number, iv: number, ev: number, level: number): number {
  return Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + level + 10;
}

export function calculateStat(
  base: number,
  iv: number,
  ev: number,
  level: number,
  multiplier: 0.9 | 1 | 1.1,
): number {
  return Math.floor(
    (Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + 5) * multiplier,
  );
}

export function calculateAllStats(
  base: PokemonStats,
  ivs: PokemonStats,
  evs: PokemonStats,
  level: number,
  nature: Nature,
): PokemonStats {
  function multiplier(stat: keyof Omit<PokemonStats, 'hp'>): 0.9 | 1 | 1.1 {
    if (nature.increased === stat) return 1.1;
    if (nature.decreased === stat) return 0.9;
    return 1;
  }

  return {
    hp: calculateHp(base.hp, ivs.hp, evs.hp, level),
    attack: calculateStat(base.attack, ivs.attack, evs.attack, level, multiplier('attack')),
    defense: calculateStat(base.defense, ivs.defense, evs.defense, level, multiplier('defense')),
    specialAttack: calculateStat(
      base.specialAttack,
      ivs.specialAttack,
      evs.specialAttack,
      level,
      multiplier('specialAttack'),
    ),
    specialDefense: calculateStat(
      base.specialDefense,
      ivs.specialDefense,
      evs.specialDefense,
      level,
      multiplier('specialDefense'),
    ),
    speed: calculateStat(base.speed, ivs.speed, evs.speed, level, multiplier('speed')),
  };
}
