export const POKEMON_TYPES = [
  'normal',
  'fire',
  'water',
  'electric',
  'grass',
  'ice',
  'fighting',
  'poison',
  'ground',
  'flying',
  'psychic',
  'bug',
  'rock',
  'ghost',
  'dragon',
  'dark',
  'steel',
  'fairy',
] as const;

export const GENERATIONS = [
  'generation-i',
  'generation-ii',
  'generation-iii',
  'generation-iv',
  'generation-v',
  'generation-vi',
  'generation-vii',
  'generation-viii',
  'generation-ix',
] as const;

export type PokemonType = (typeof POKEMON_TYPES)[number];
export type Generation = (typeof GENERATIONS)[number];

export interface PokemonStats {
  readonly hp: number;
  readonly attack: number;
  readonly defense: number;
  readonly specialAttack: number;
  readonly specialDefense: number;
  readonly speed: number;
}

export interface PokemonSummary {
  readonly id: number;
  readonly name: string;
  readonly displayName: string;
  readonly types: readonly PokemonType[];
  readonly generation: Generation;
  readonly sprite: string;
}

export interface Pokemon extends PokemonSummary {
  readonly artwork: string;
  readonly shinyArtwork: string;
  readonly stats: PokemonStats;
  readonly evolutionChainId: number;
}

/** Derives generation from national Pokédex ID (no extra API call needed). */
export function getGenerationFromId(id: number): Generation {
  if (id <= 151) return 'generation-i';
  if (id <= 251) return 'generation-ii';
  if (id <= 386) return 'generation-iii';
  if (id <= 493) return 'generation-iv';
  if (id <= 649) return 'generation-v';
  if (id <= 721) return 'generation-vi';
  if (id <= 809) return 'generation-vii';
  if (id <= 905) return 'generation-viii';
  return 'generation-ix';
}

/** Converts PokeAPI hyphenated name to title-case display name. */
export function formatPokemonName(name: string): string {
  return name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

/** Extracts numeric ID from a PokeAPI resource URL. */
export function extractIdFromUrl(url: string): number {
  const match = url.match(/\/(\d+)\/?$/);
  if (!match) throw new Error(`Could not extract ID from URL: ${url}`);
  return parseInt(match[1], 10);
}

/** Returns official artwork URL for a given Pokémon ID (no extra API call). */
export function getOfficialArtworkUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

/** Returns shiny official artwork URL for a given Pokémon ID (no extra API call). */
export function getShinyArtworkUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${id}.png`;
}

/** Returns default sprite URL for a given Pokémon ID. */
export function getSpriteUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}
