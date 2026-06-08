import type { Pokemon } from '../../domain/entities/Pokemon';
import type { PokemonRepository } from '../../domain/ports/PokemonRepository';

export async function getPokemonForm(
  repository: PokemonRepository,
  id: number,
): Promise<Pokemon | null> {
  return repository.findById(id);
}
