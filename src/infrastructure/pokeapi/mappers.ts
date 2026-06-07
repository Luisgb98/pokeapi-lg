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
import type { PokemonSpecies } from '../../domain/entities/PokemonSpecies';
import type {
  PokeApiEvolutionChain,
  PokeApiEvolutionChainLink,
  PokeApiPokemon,
  PokeApiSpecies,
  PokeApiStatEntry,
} from './types';

const LOCALE_TO_POKEAPI_LANG: Record<string, string> = {
  en: 'en',
  es: 'es',
  de: 'de',
  fr: 'fr',
  it: 'it',
  pt: 'pt',
};

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

export function mapPokemonSpecies(raw: PokeApiSpecies, locale: string): PokemonSpecies {
  const lang = LOCALE_TO_POKEAPI_LANG[locale] ?? 'en';

  const localeFlavors = raw.flavor_text_entries.filter((e) => e.language.name === lang);
  const englishFlavors = raw.flavor_text_entries.filter((e) => e.language.name === 'en');
  const entry = (localeFlavors.length > 0 ? localeFlavors : englishFlavors).at(-1);
  const flavorText = (entry?.flavor_text ?? '')
    .replace(/\f/g, ' ')
    .replace(/\n/g, ' ')
    .replace(/­/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  const genusEntry =
    raw.genera.find((g) => g.language.name === lang) ??
    raw.genera.find((g) => g.language.name === 'en');

  return {
    genus: genusEntry?.genus ?? '',
    flavorText,
    eggGroups: raw.egg_groups.map((g) => g.name),
    genderRate: raw.gender_rate,
    captureRate: raw.capture_rate,
    baseHappiness: raw.base_happiness ?? 0,
  };
}
