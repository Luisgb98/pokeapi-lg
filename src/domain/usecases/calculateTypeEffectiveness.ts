import { POKEMON_TYPES } from '../entities/Pokemon';
import type { PokemonType } from '../entities/Pokemon';
import { TYPE_CHART } from '../data/typeChart';

export function calculateDefenseEffectiveness(
  defenderTypes: PokemonType[],
): Record<PokemonType, number> {
  const result = {} as Record<PokemonType, number>;
  for (const attackType of POKEMON_TYPES) {
    result[attackType] = defenderTypes.reduce(
      (mult, defType) => mult * (TYPE_CHART[attackType][defType] ?? 1),
      1,
    );
  }
  return result;
}
