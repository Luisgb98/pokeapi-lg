export interface PokeApiNamedResource {
  name: string;
  url: string;
}

export interface PokeApiPaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokeApiNamedResource[];
}

export interface PokeApiStatEntry {
  base_stat: number;
  stat: PokeApiNamedResource;
}

export interface PokeApiTypeSlot {
  slot: number;
  type: PokeApiNamedResource;
}

export interface PokeApiSprites {
  front_default: string | null;
  other: {
    'official-artwork': {
      front_default: string | null;
    };
  };
}

export interface PokeApiPokemonMoveDetail {
  level_learned_at: number;
  move_learn_method: PokeApiNamedResource;
  version_group: PokeApiNamedResource;
}

export interface PokeApiPokemonMove {
  move: PokeApiNamedResource;
  version_group_details: PokeApiPokemonMoveDetail[];
}

export interface PokeApiPokemon {
  id: number;
  name: string;
  sprites: PokeApiSprites;
  stats: PokeApiStatEntry[];
  types: PokeApiTypeSlot[];
  species: PokeApiNamedResource;
  moves?: PokeApiPokemonMove[];
}

export interface PokeApiMove {
  id: number;
  name: string;
  accuracy: number | null;
  pp: number;
  power: number | null;
  damage_class: PokeApiNamedResource;
  type: PokeApiNamedResource;
  names: Array<{
    language: PokeApiNamedResource;
    name: string;
  }>;
}

export interface PokeApiSpecies {
  id: number;
  name: string;
  generation: PokeApiNamedResource;
  evolution_chain: { url: string };
  flavor_text_entries: Array<{
    flavor_text: string;
    language: PokeApiNamedResource;
    version: PokeApiNamedResource;
  }>;
  genera: Array<{
    genus: string;
    language: PokeApiNamedResource;
  }>;
  egg_groups: PokeApiNamedResource[];
  gender_rate: number;
  capture_rate: number;
  base_happiness: number | null;
}

export interface PokeApiEvolutionChainLink {
  species: PokeApiNamedResource;
  evolves_to: PokeApiEvolutionChainLink[];
}

export interface PokeApiEvolutionChain {
  id: number;
  chain: PokeApiEvolutionChainLink;
}

export interface PokeApiTypeDetail {
  id: number;
  name: string;
  pokemon: Array<{
    slot: number;
    pokemon: PokeApiNamedResource;
  }>;
}
