import type { LearnedMove } from '@/domain/entities/Move';
import type { PokemonRepository } from '@/domain/ports/PokemonRepository';

export async function getMoveLearnset(
  repository: PokemonRepository,
  id: number,
  locale: string,
): Promise<readonly LearnedMove[]> {
  return repository.findMoveLearnset(id, locale);
}
