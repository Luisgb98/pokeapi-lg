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

export interface PokeApiPokemon {
  id: number;
  name: string;
  sprites: PokeApiSprites;
  stats: PokeApiStatEntry[];
  types: PokeApiTypeSlot[];
  species: PokeApiNamedResource;
}

export interface PokeApiSpecies {
  id: number;
  name: string;
  generation: PokeApiNamedResource;
  evolution_chain: { url: string };
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
