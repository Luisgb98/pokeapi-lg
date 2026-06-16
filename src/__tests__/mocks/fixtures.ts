import type {
  PokeApiAbility,
  PokeApiEvolutionChain,
  PokeApiMove,
  PokeApiPokemon,
  PokeApiSpecies,
  PokeApiTypeDetail,
} from '../../infrastructure/pokeapi/types';

export const pikachuRaw: PokeApiPokemon = {
  id: 25,
  name: 'pikachu',
  height: 4,
  weight: 60,
  abilities: [
    { ability: { name: 'static', url: '' }, is_hidden: false, slot: 1 },
    { ability: { name: 'lightning-rod', url: '' }, is_hidden: true, slot: 3 },
  ],
  sprites: {
    front_default: 'https://sprites.pokemon.com/pikachu.png',
    front_shiny: 'https://sprites.pokemon.com/shiny/pikachu.png',
    other: {
      'official-artwork': {
        front_default: 'https://artwork.pokemon.com/pikachu.png',
        front_shiny: 'https://artwork.pokemon.com/shiny/pikachu.png',
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
  moves: [
    {
      move: { name: 'thundershock', url: 'https://pokeapi.co/api/v2/move/84/' },
      version_group_details: [
        {
          level_learned_at: 1,
          move_learn_method: { name: 'level-up', url: '' },
          version_group: { name: 'scarlet-violet', url: '' },
        },
      ],
    },
  ],
};

export const pichuRaw: PokeApiPokemon = {
  id: 172,
  name: 'pichu',
  height: 3,
  weight: 20,
  abilities: [{ ability: { name: 'static', url: '' }, is_hidden: false, slot: 1 }],
  sprites: {
    front_default: 'https://sprites.pokemon.com/pichu.png',
    front_shiny: null,
    other: { 'official-artwork': { front_default: null, front_shiny: null } },
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
  height: 8,
  weight: 300,
  abilities: [
    { ability: { name: 'static', url: '' }, is_hidden: false, slot: 1 },
    { ability: { name: 'lightning-rod', url: '' }, is_hidden: true, slot: 3 },
  ],
  sprites: {
    front_default: 'https://sprites.pokemon.com/raichu.png',
    front_shiny: null,
    other: { 'official-artwork': { front_default: null, front_shiny: null } },
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
  names: [
    { name: 'Pikachu', language: { name: 'en', url: '' } },
    { name: 'Pikachu', language: { name: 'de', url: '' } },
    { name: 'Pikachu', language: { name: 'fr', url: '' } },
  ],
  flavor_text_entries: [
    {
      flavor_text:
        'When several of these\npokémon gather,\ftheir electricity can cause lightning storms.',
      language: { name: 'en', url: '' },
      version: { name: 'red', url: '' },
    },
    {
      flavor_text:
        'Cuando varios de estos Pokémon se reúnen, su electricidad puede causar tormentas.',
      language: { name: 'es', url: '' },
      version: { name: 'x', url: '' },
    },
  ],
  genera: [
    { genus: 'Mouse Pokémon', language: { name: 'en', url: '' } },
    { genus: 'Ratón Pokémon', language: { name: 'es', url: '' } },
  ],
  egg_groups: [
    { name: 'field', url: '' },
    { name: 'fairy', url: '' },
  ],
  gender_rate: 4,
  capture_rate: 190,
  base_happiness: 70,
  varieties: [
    {
      is_default: true,
      pokemon: { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' },
    },
  ],
};

export const pichuSpecies: PokeApiSpecies = {
  id: 172,
  name: 'pichu',
  generation: { name: 'generation-ii', url: '' },
  evolution_chain: { url: 'https://pokeapi.co/api/v2/evolution-chain/10/' },
  names: [
    { name: 'Pichu', language: { name: 'en', url: '' } },
    { name: 'Pichu', language: { name: 'de', url: '' } },
  ],
  flavor_text_entries: [
    {
      flavor_text: 'Despite its small size, it can zap even adult humans.',
      language: { name: 'en', url: '' },
      version: { name: 'gold', url: '' },
    },
  ],
  genera: [{ genus: 'Tiny Mouse Pokémon', language: { name: 'en', url: '' } }],
  egg_groups: [{ name: 'undiscovered', url: '' }],
  gender_rate: 4,
  capture_rate: 190,
  base_happiness: 70,
  varieties: [
    { is_default: true, pokemon: { name: 'pichu', url: 'https://pokeapi.co/api/v2/pokemon/172/' } },
  ],
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

export const thundershockMove: PokeApiMove = {
  id: 84,
  name: 'thundershock',
  accuracy: 100,
  pp: 30,
  power: 40,
  damage_class: { name: 'special', url: '' },
  type: { name: 'electric', url: '' },
  names: [
    { name: 'ThunderShock', language: { name: 'en', url: '' } },
    { name: 'Donnerschock', language: { name: 'de', url: '' } },
  ],
};

export const bulbasaurRaw: PokeApiPokemon = {
  id: 1,
  name: 'bulbasaur',
  height: 7,
  weight: 69,
  abilities: [
    { ability: { name: 'overgrow', url: '' }, is_hidden: false, slot: 1 },
    { ability: { name: 'chlorophyll', url: '' }, is_hidden: true, slot: 3 },
  ],
  sprites: {
    front_default: 'https://sprites.pokemon.com/bulbasaur.png',
    front_shiny: null,
    other: { 'official-artwork': { front_default: null, front_shiny: null } },
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

export const staticAbility: PokeApiAbility = {
  id: 9,
  name: 'static',
  names: [
    { name: 'Static', language: { name: 'en', url: '' } },
    { name: 'Statik', language: { name: 'de', url: '' } },
  ],
  flavor_text_entries: [
    {
      flavor_text: 'May cause paralysis\nif the foe touches\fthe Pokémon.',
      language: { name: 'en', url: '' },
    },
    {
      flavor_text: 'Kann den Gegner lähmen,\nwenn er berührt wird.',
      language: { name: 'de', url: '' },
    },
  ],
};

export const lightningRodAbility: PokeApiAbility = {
  id: 31,
  name: 'lightning-rod',
  names: [
    { name: 'Lightning Rod', language: { name: 'en', url: '' } },
    { name: 'Blitzfänger', language: { name: 'de', url: '' } },
  ],
  flavor_text_entries: [
    {
      flavor_text: 'Draws in all Electric-type moves to boost Sp. Atk.',
      language: { name: 'en', url: '' },
    },
  ],
};
