import type {
  PokeApiEvolutionChain,
  PokeApiPokemon,
  PokeApiSpecies,
  PokeApiTypeDetail,
} from '../../infrastructure/pokeapi/types';

export const pikachuRaw: PokeApiPokemon = {
  id: 25,
  name: 'pikachu',
  sprites: {
    front_default: 'https://sprites.pokemon.com/pikachu.png',
    other: {
      'official-artwork': {
        front_default: 'https://artwork.pokemon.com/pikachu.png',
      },
    },
  },
  stats: [
    { base_stat: 35, stat: { name: 'hp', url: '' } },
    { base_stat: 55, stat: { name: 'attack', url: '' } },
    { base_stat: 40, stat: { name: 'defense', url: '' } },
    { base_stat: 50, stat: { name: 'special-attack', url: '' } },
    { base_stat: 50, stat: { name: 'special-defense', url: '' } },
    { base_stat: 90, stat: { name: 'speed', url: '' } },
  ],
  types: [{ slot: 1, type: { name: 'electric', url: '' } }],
  species: { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon-species/25/' },
};

export const pichuRaw: PokeApiPokemon = {
  id: 172,
  name: 'pichu',
  sprites: {
    front_default: 'https://sprites.pokemon.com/pichu.png',
    other: { 'official-artwork': { front_default: null } },
  },
  stats: [
    { base_stat: 20, stat: { name: 'hp', url: '' } },
    { base_stat: 40, stat: { name: 'attack', url: '' } },
    { base_stat: 15, stat: { name: 'defense', url: '' } },
    { base_stat: 35, stat: { name: 'special-attack', url: '' } },
    { base_stat: 35, stat: { name: 'special-defense', url: '' } },
    { base_stat: 60, stat: { name: 'speed', url: '' } },
  ],
  types: [{ slot: 1, type: { name: 'electric', url: '' } }],
  species: { name: 'pichu', url: 'https://pokeapi.co/api/v2/pokemon-species/172/' },
};

export const raichuRaw: PokeApiPokemon = {
  id: 26,
  name: 'raichu',
  sprites: {
    front_default: 'https://sprites.pokemon.com/raichu.png',
    other: { 'official-artwork': { front_default: null } },
  },
  stats: [
    { base_stat: 60, stat: { name: 'hp', url: '' } },
    { base_stat: 90, stat: { name: 'attack', url: '' } },
    { base_stat: 55, stat: { name: 'defense', url: '' } },
    { base_stat: 90, stat: { name: 'special-attack', url: '' } },
    { base_stat: 80, stat: { name: 'special-defense', url: '' } },
    { base_stat: 110, stat: { name: 'speed', url: '' } },
  ],
  types: [{ slot: 1, type: { name: 'electric', url: '' } }],
  species: { name: 'raichu', url: 'https://pokeapi.co/api/v2/pokemon-species/26/' },
};

export const pikachuSpecies: PokeApiSpecies = {
  id: 25,
  name: 'pikachu',
  generation: { name: 'generation-i', url: '' },
  evolution_chain: { url: 'https://pokeapi.co/api/v2/evolution-chain/10/' },
};

export const pichuSpecies: PokeApiSpecies = {
  id: 172,
  name: 'pichu',
  generation: { name: 'generation-ii', url: '' },
  evolution_chain: { url: 'https://pokeapi.co/api/v2/evolution-chain/10/' },
};

export const pikachuChain: PokeApiEvolutionChain = {
  id: 10,
  chain: {
    species: { name: 'pichu', url: 'https://pokeapi.co/api/v2/pokemon-species/172/' },
    evolves_to: [
      {
        species: { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon-species/25/' },
        evolves_to: [
          {
            species: { name: 'raichu', url: 'https://pokeapi.co/api/v2/pokemon-species/26/' },
            evolves_to: [],
          },
        ],
      },
    ],
  },
};

export const electricTypeDetail: PokeApiTypeDetail = {
  id: 13,
  name: 'electric',
  pokemon: [
    { slot: 1, pokemon: { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' } },
    { slot: 1, pokemon: { name: 'raichu', url: 'https://pokeapi.co/api/v2/pokemon/26/' } },
    { slot: 1, pokemon: { name: 'pichu', url: 'https://pokeapi.co/api/v2/pokemon/172/' } },
  ],
};

export const grassTypeDetail: PokeApiTypeDetail = {
  id: 12,
  name: 'grass',
  pokemon: [
    { slot: 1, pokemon: { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' } },
  ],
};

export const allPokemonList = {
  count: 4,
  next: null,
  previous: null,
  results: [
    { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
    { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' },
    { name: 'raichu', url: 'https://pokeapi.co/api/v2/pokemon/26/' },
    { name: 'pichu', url: 'https://pokeapi.co/api/v2/pokemon/172/' },
  ],
};

export const bulbasaurRaw: PokeApiPokemon = {
  id: 1,
  name: 'bulbasaur',
  sprites: {
    front_default: 'https://sprites.pokemon.com/bulbasaur.png',
    other: { 'official-artwork': { front_default: null } },
  },
  stats: [
    { base_stat: 45, stat: { name: 'hp', url: '' } },
    { base_stat: 49, stat: { name: 'attack', url: '' } },
    { base_stat: 49, stat: { name: 'defense', url: '' } },
    { base_stat: 65, stat: { name: 'special-attack', url: '' } },
    { base_stat: 65, stat: { name: 'special-defense', url: '' } },
    { base_stat: 45, stat: { name: 'speed', url: '' } },
  ],
  types: [
    { slot: 1, type: { name: 'grass', url: '' } },
    { slot: 2, type: { name: 'poison', url: '' } },
  ],
  species: { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon-species/1/' },
};
