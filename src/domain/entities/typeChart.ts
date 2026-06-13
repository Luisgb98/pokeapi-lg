import { POKEMON_TYPES } from './Pokemon';
import type { PokemonType } from './Pokemon';

// Gen 6+ type chart (includes Fairy; Steel no longer resists Ghost/Dark)
// TYPE_CHART[attackingType][defendingType] = damage multiplier
const TYPE_CHART: Record<PokemonType, Record<PokemonType, number>> = {
  normal: {
    normal: 1,
    fire: 1,
    water: 1,
    electric: 1,
    grass: 1,
    ice: 1,
    fighting: 1,
    poison: 1,
    ground: 1,
    flying: 1,
    psychic: 1,
    bug: 1,
    rock: 0.5,
    ghost: 0,
    dragon: 1,
    dark: 1,
    steel: 0.5,
    fairy: 1,
  },
  fire: {
    normal: 1,
    fire: 0.5,
    water: 0.5,
    electric: 1,
    grass: 2,
    ice: 2,
    fighting: 1,
    poison: 1,
    ground: 1,
    flying: 1,
    psychic: 1,
    bug: 2,
    rock: 0.5,
    ghost: 1,
    dragon: 0.5,
    dark: 1,
    steel: 2,
    fairy: 1,
  },
  water: {
    normal: 1,
    fire: 2,
    water: 0.5,
    electric: 1,
    grass: 0.5,
    ice: 1,
    fighting: 1,
    poison: 1,
    ground: 2,
    flying: 1,
    psychic: 1,
    bug: 1,
    rock: 2,
    ghost: 1,
    dragon: 0.5,
    dark: 1,
    steel: 1,
    fairy: 1,
  },
  electric: {
    normal: 1,
    fire: 1,
    water: 2,
    electric: 0.5,
    grass: 0.5,
    ice: 1,
    fighting: 1,
    poison: 1,
    ground: 0,
    flying: 2,
    psychic: 1,
    bug: 1,
    rock: 1,
    ghost: 1,
    dragon: 0.5,
    dark: 1,
    steel: 1,
    fairy: 1,
  },
  grass: {
    normal: 1,
    fire: 0.5,
    water: 2,
    electric: 1,
    grass: 0.5,
    ice: 1,
    fighting: 1,
    poison: 0.5,
    ground: 2,
    flying: 0.5,
    psychic: 1,
    bug: 0.5,
    rock: 2,
    ghost: 1,
    dragon: 0.5,
    dark: 1,
    steel: 0.5,
    fairy: 1,
  },
  ice: {
    normal: 1,
    fire: 0.5,
    water: 0.5,
    electric: 1,
    grass: 2,
    ice: 0.5,
    fighting: 1,
    poison: 1,
    ground: 2,
    flying: 2,
    psychic: 1,
    bug: 1,
    rock: 1,
    ghost: 1,
    dragon: 2,
    dark: 1,
    steel: 0.5,
    fairy: 1,
  },
  fighting: {
    normal: 2,
    fire: 1,
    water: 1,
    electric: 1,
    grass: 1,
    ice: 2,
    fighting: 1,
    poison: 0.5,
    ground: 1,
    flying: 0.5,
    psychic: 0.5,
    bug: 0.5,
    rock: 2,
    ghost: 0,
    dragon: 1,
    dark: 2,
    steel: 2,
    fairy: 0.5,
  },
  poison: {
    normal: 1,
    fire: 1,
    water: 1,
    electric: 1,
    grass: 2,
    ice: 1,
    fighting: 1,
    poison: 0.5,
    ground: 0.5,
    flying: 1,
    psychic: 1,
    bug: 1,
    rock: 0.5,
    ghost: 0.5,
    dragon: 1,
    dark: 1,
    steel: 0,
    fairy: 2,
  },
  ground: {
    normal: 1,
    fire: 2,
    water: 1,
    electric: 2,
    grass: 0.5,
    ice: 1,
    fighting: 1,
    poison: 2,
    ground: 1,
    flying: 0,
    psychic: 1,
    bug: 0.5,
    rock: 2,
    ghost: 1,
    dragon: 1,
    dark: 1,
    steel: 2,
    fairy: 1,
  },
  flying: {
    normal: 1,
    fire: 1,
    water: 1,
    electric: 0.5,
    grass: 2,
    ice: 1,
    fighting: 2,
    poison: 1,
    ground: 1,
    flying: 1,
    psychic: 1,
    bug: 2,
    rock: 0.5,
    ghost: 1,
    dragon: 1,
    dark: 1,
    steel: 0.5,
    fairy: 1,
  },
  psychic: {
    normal: 1,
    fire: 1,
    water: 1,
    electric: 1,
    grass: 1,
    ice: 1,
    fighting: 2,
    poison: 2,
    ground: 1,
    flying: 1,
    psychic: 0.5,
    bug: 1,
    rock: 1,
    ghost: 1,
    dragon: 1,
    dark: 0,
    steel: 0.5,
    fairy: 1,
  },
  bug: {
    normal: 1,
    fire: 0.5,
    water: 1,
    electric: 1,
    grass: 2,
    ice: 1,
    fighting: 0.5,
    poison: 0.5,
    ground: 1,
    flying: 0.5,
    psychic: 2,
    bug: 1,
    rock: 1,
    ghost: 0.5,
    dragon: 1,
    dark: 2,
    steel: 0.5,
    fairy: 0.5,
  },
  rock: {
    normal: 1,
    fire: 2,
    water: 1,
    electric: 1,
    grass: 1,
    ice: 2,
    fighting: 0.5,
    poison: 1,
    ground: 0.5,
    flying: 2,
    psychic: 1,
    bug: 2,
    rock: 1,
    ghost: 1,
    dragon: 1,
    dark: 1,
    steel: 0.5,
    fairy: 1,
  },
  ghost: {
    normal: 0,
    fire: 1,
    water: 1,
    electric: 1,
    grass: 1,
    ice: 1,
    fighting: 1,
    poison: 1,
    ground: 1,
    flying: 1,
    psychic: 2,
    bug: 1,
    rock: 1,
    ghost: 2,
    dragon: 1,
    dark: 0.5,
    steel: 1,
    fairy: 1,
  },
  dragon: {
    normal: 1,
    fire: 1,
    water: 1,
    electric: 1,
    grass: 1,
    ice: 1,
    fighting: 1,
    poison: 1,
    ground: 1,
    flying: 1,
    psychic: 1,
    bug: 1,
    rock: 1,
    ghost: 1,
    dragon: 2,
    dark: 1,
    steel: 0.5,
    fairy: 0,
  },
  dark: {
    normal: 1,
    fire: 1,
    water: 1,
    electric: 1,
    grass: 1,
    ice: 1,
    fighting: 0.5,
    poison: 1,
    ground: 1,
    flying: 1,
    psychic: 2,
    bug: 1,
    rock: 1,
    ghost: 2,
    dragon: 1,
    dark: 0.5,
    steel: 1,
    fairy: 0.5,
  },
  steel: {
    normal: 1,
    fire: 0.5,
    water: 0.5,
    electric: 0.5,
    grass: 1,
    ice: 2,
    fighting: 1,
    poison: 1,
    ground: 1,
    flying: 1,
    psychic: 1,
    bug: 1,
    rock: 2,
    ghost: 1,
    dragon: 1,
    dark: 1,
    steel: 0.5,
    fairy: 2,
  },
  fairy: {
    normal: 1,
    fire: 0.5,
    water: 1,
    electric: 1,
    grass: 1,
    ice: 1,
    fighting: 2,
    poison: 0.5,
    ground: 1,
    flying: 1,
    psychic: 1,
    bug: 1,
    rock: 1,
    ghost: 1,
    dragon: 2,
    dark: 2,
    steel: 0.5,
    fairy: 1,
  },
};

export function getTypeChart(): Record<PokemonType, Record<PokemonType, number>> {
  return TYPE_CHART;
}

export interface TeamCoverageEntry {
  readonly attackingType: PokemonType;
  readonly x4Count: number;
  readonly x2Count: number;
  readonly neutralCount: number;
  readonly halfCount: number;
  readonly quarterCount: number;
  readonly immuneCount: number;
}

export function computeTeamCoverage(
  team: readonly (readonly PokemonType[])[],
): readonly TeamCoverageEntry[] {
  return POKEMON_TYPES.map((attackingType) => {
    let x4Count = 0,
      x2Count = 0,
      neutralCount = 0,
      halfCount = 0,
      quarterCount = 0,
      immuneCount = 0;

    for (const memberTypes of team) {
      const multiplier = memberTypes.reduce(
        (acc, defendingType) => acc * TYPE_CHART[attackingType][defendingType],
        1,
      );
      if (multiplier === 0) immuneCount++;
      else if (multiplier === 0.25) quarterCount++;
      else if (multiplier === 0.5) halfCount++;
      else if (multiplier === 2) x2Count++;
      else if (multiplier === 4) x4Count++;
      else neutralCount++;
    }

    return { attackingType, x4Count, x2Count, neutralCount, halfCount, quarterCount, immuneCount };
  });
}

export interface DefensiveMatchups {
  readonly x4: readonly PokemonType[];
  readonly x2: readonly PokemonType[];
  readonly half: readonly PokemonType[];
  readonly quarter: readonly PokemonType[];
  readonly immune: readonly PokemonType[];
}

export function computeDefensiveMatchups(types: readonly PokemonType[]): DefensiveMatchups {
  const x4: PokemonType[] = [];
  const x2: PokemonType[] = [];
  const half: PokemonType[] = [];
  const quarter: PokemonType[] = [];
  const immune: PokemonType[] = [];

  for (const attackingType of POKEMON_TYPES) {
    const multiplier = types.reduce(
      (acc, defendingType) => acc * TYPE_CHART[attackingType][defendingType],
      1,
    );

    if (multiplier === 0) immune.push(attackingType);
    else if (multiplier === 0.25) quarter.push(attackingType);
    else if (multiplier === 0.5) half.push(attackingType);
    else if (multiplier === 2) x2.push(attackingType);
    else if (multiplier === 4) x4.push(attackingType);
    // neutral (1×) is intentionally omitted
  }

  return { x4, x2, half, quarter, immune };
}

export interface OffensiveCoverageEntry {
  /** The single defending type being evaluated. */
  readonly defendingType: PokemonType;
  /** Best STAB multiplier any team member achieves vs this type (0 | 0.5 | 1 | 2). */
  readonly bestMultiplier: number;
  /** How many team members have a STAB type that hits this type super-effectively. */
  readonly superEffectiveCount: number;
}

/**
 * STAB-only offensive coverage: for each defending type, the best multiplier
 * achievable using only the team members' own types as attacking types.
 * Coverage moves are intentionally ignored (approximation).
 */
export function computeOffensiveCoverage(
  team: readonly (readonly PokemonType[])[],
): readonly OffensiveCoverageEntry[] {
  return POKEMON_TYPES.map((defendingType) => {
    let bestMultiplier = 0;
    let superEffectiveCount = 0;

    for (const memberTypes of team) {
      const memberBest = Math.max(...memberTypes.map((t) => TYPE_CHART[t][defendingType]));
      if (memberBest > bestMultiplier) bestMultiplier = memberBest;
      if (memberBest >= 2) superEffectiveCount++;
    }

    return { defendingType, bestMultiplier, superEffectiveCount };
  });
}
