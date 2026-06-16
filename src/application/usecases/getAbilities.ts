import type { Ability } from '../../domain/entities/Ability';
import type { PokemonAbilityRef } from '../../domain/entities/Pokemon';
import type { PokemonRepository } from '../../domain/ports/PokemonRepository';

export async function getAbilities(
  repository: PokemonRepository,
  refs: readonly PokemonAbilityRef[],
  locale: string,
): Promise<readonly Ability[]> {
  if (refs.length === 0) return [];
  return repository.findAbilities(refs, locale);
}
