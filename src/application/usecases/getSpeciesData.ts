import type { PokemonSpecies } from '../../domain/entities/PokemonSpecies';
import type { PokemonRepository } from '../../domain/ports/PokemonRepository';

export async function getSpeciesData(
  repository: PokemonRepository,
  id: number,
  locale: string,
): Promise<PokemonSpecies> {
  return repository.findSpeciesData(id, locale);
}
