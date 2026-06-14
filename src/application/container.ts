import { PokeApiRepository } from '../infrastructure/pokeapi/PokeApiRepository';
import type { PokemonRepository } from '../domain/ports/PokemonRepository';
import { DrizzleUserDataRepository } from '../infrastructure/db/DrizzleUserDataRepository';
import type { UserDataRepository } from '../domain/ports/UserDataRepository';
import { getDb } from '../infrastructure/db/client';

/**
 * Module-level singleton repository shared across all server requests in this process.
 *
 * This is intentional for public Pokémon data: the PokeAPI returns the same
 * payload for all users, so a process-wide in-memory cache is safe and desirable.
 *
 * FOOTGUN: Do NOT add user-specific data (session tokens, rate-limit state,
 * user preferences, A/B variants) to PokeApiRepository or its caches. Any
 * data cached here is visible to all concurrent requests. If user-specific
 * caching is ever needed, create a separate per-request repository factory
 * and do NOT use this singleton for it.
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

let _userDataRepository: UserDataRepository | null = null;

export function getUserDataRepository(): UserDataRepository {
  if (!_userDataRepository) {
    _userDataRepository = new DrizzleUserDataRepository(getDb());
  }
  return _userDataRepository;
}

/** For testing: inject a mock user data repository. */
export function setUserDataRepository(repo: UserDataRepository): void {
  _userDataRepository = repo;
}

/** For testing: reset to default. */
export function resetUserDataRepository(): void {
  _userDataRepository = null;
}
