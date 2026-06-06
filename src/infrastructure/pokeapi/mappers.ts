import {
  extractIdFromUrl,
  formatPokemonName,
  getGenerationFromId,
  getOfficialArtworkUrl,
  getSpriteUrl,
  type Pokemon,
  type PokemonStats,
  type PokemonSummary,
  type PokemonType,
} from '../../domain/entities/Pokemon';
import type { EvolutionChain, EvolutionNode } from '../../domain/entities/EvolutionChain';
import type {
  PokeApiEvolutionChain,
  PokeApiEvolutionChainLink,
  PokeApiPokemon,
  PokeApiStatEntry,
} from './types';

function mapStats(stats: PokeApiStatEntry[]): PokemonStats {
  const get = (name: string) => stats.find((s) => s.stat.name === name)?.base_stat ?? 0;

  return {
    hp: get('hp'),
    attack: get('attack'),
    defense: get('defense'),
    specialAttack: get('special-attack'),
    specialDefense: get('special-defense'),
    speed: get('speed'),
  };
}

export function mapPokemonSummary(raw: PokeApiPokemon): PokemonSummary {
  return {
    id: raw.id,
    name: raw.name,
    displayName: formatPokemonName(raw.name),
    types: raw.types.sort((a, b) => a.slot - b.slot).map((t) => t.type.name as PokemonType),
    generation: getGenerationFromId(raw.id),
    sprite: raw.sprites.front_default ?? getSpriteUrl(raw.id),
  };
}

export function mapPokemon(raw: PokeApiPokemon, evolutionChainId: number): Pokemon {
  return {
    ...mapPokemonSummary(raw),
    artwork: raw.sprites.other['official-artwork'].front_default ?? getOfficialArtworkUrl(raw.id),
    stats: mapStats(raw.stats),
    evolutionChainId,
  };
}

function mapEvolutionNode(link: PokeApiEvolutionChainLink): EvolutionNode {
  const id = extractIdFromUrl(link.species.url);
  return {
    id,
    name: link.species.name,
    displayName: formatPokemonName(link.species.name),
    sprite: getSpriteUrl(id),
    evolvesTo: link.evolves_to.map(mapEvolutionNode),
  };
}

export function mapEvolutionChain(raw: PokeApiEvolutionChain): EvolutionChain {
  return {
    id: raw.id,
    chain: mapEvolutionNode(raw.chain),
  };
}
