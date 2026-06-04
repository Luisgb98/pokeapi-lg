import type { Pokemon } from '../../domain/entities/Pokemon';
import type { EvolutionChain } from '../../domain/entities/EvolutionChain';
import type { PokemonRepository } from '../../domain/ports/PokemonRepository';

export interface GetPokemonByIdOutput {
  pokemon: Pokemon;
  evolutionChain: EvolutionChain;
}

export class PokemonNotFoundError extends Error {
  constructor(id: number) {
    super(`Pokémon with id ${id} not found`);
    this.name = 'PokemonNotFoundError';
  }
}

export async function getPokemonById(
  repository: PokemonRepository,
  id: number,
): Promise<GetPokemonByIdOutput> {
  const pokemon = await repository.findById(id);

  if (!pokemon) {
    throw new PokemonNotFoundError(id);
  }

  const evolutionChain = await repository.findEvolutionChain(pokemon.evolutionChainId);

  return { pokemon, evolutionChain };
}
