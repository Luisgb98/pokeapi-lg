import { PokeApiRepository } from '../infrastructure/pokeapi/PokeApiRepository';
import type { PokemonRepository } from '../domain/ports/PokemonRepository';

/**
 * Singleton repository instance shared across all server requests.
 * The in-memory caches live here.
 */
let _repository: PokemonRepository | null = null;

export function getRepository(): PokemonRepository {
  if (!_repository) {
    _repository = new PokeApiRepository();
  }
  return _repository;
}

/** For testing: inject a mock repository. */
export function setRepository(repo: PokemonRepository): void {
  _repository = repo;
}

/** For testing: reset to default. */
export function resetRepository(): void {
  _repository = null;
}
