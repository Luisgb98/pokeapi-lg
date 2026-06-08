import { describe, expect, it } from 'vitest';
import {
  mapEvolutionChain,
  mapMove,
  mapPokemon,
  mapPokemonSpecies,
  mapPokemonSummary,
} from '../../infrastructure/pokeapi/mappers';
import {
  bulbasaurRaw,
  pikachuChain,
  pikachuRaw,
  pikachuSpecies,
  thundershockMove,
} from '../mocks/fixtures';

describe('mapPokemonSummary', () => {
  it('maps basic fields correctly', () => {
    const result = mapPokemonSummary(pikachuRaw);

    expect(result.id).toBe(25);
    expect(result.name).toBe('pikachu');
    expect(result.displayName).toBe('Pikachu');
    expect(result.types).toEqual(['electric']);
    expect(result.generation).toBe('generation-i');
    expect(result.sprite).toBe('https://sprites.pokemon.com/pikachu.png');
  });

  it('falls back to computed sprite URL when front_default is null', () => {
    const noSprite = {
      ...pikachuRaw,
      sprites: { ...pikachuRaw.sprites, front_default: null },
    };
    const result = mapPokemonSummary(noSprite);
    expect(result.sprite).toContain('githubusercontent.com');
  });

  it('sorts types by slot', () => {
    const result = mapPokemonSummary(bulbasaurRaw);
    expect(result.types).toEqual(['grass', 'poison']);
  });

  it('derives generation from ID', () => {
    const result = mapPokemonSummary(bulbasaurRaw); // id=1
    expect(result.generation).toBe('generation-i');
  });
});

describe('mapPokemon', () => {
  it('includes all summary fields plus stats and evolutionChainId', () => {
    const result = mapPokemon(pikachuRaw, 10);

    expect(result.id).toBe(25);
    expect(result.evolutionChainId).toBe(10);
    expect(result.artwork).toBe('https://artwork.pokemon.com/pikachu.png');
    expect(result.stats).toEqual({
      hp: 35,
      attack: 55,
      defense: 40,
      specialAttack: 50,
      specialDefense: 50,
      speed: 90,
    });
  });

  it('falls back to computed artwork URL when official-artwork is null', () => {
    const noArtwork = {
      ...pikachuRaw,
      sprites: {
        ...pikachuRaw.sprites,
        other: { 'official-artwork': { front_default: null } },
      },
    };
    const result = mapPokemon(noArtwork, 10);
    expect(result.artwork).toContain('official-artwork');
  });
});

describe('mapEvolutionChain', () => {
  it('maps chain id', () => {
    const result = mapEvolutionChain(pikachuChain);
    expect(result.id).toBe(10);
  });

  it('maps root of chain correctly', () => {
    const result = mapEvolutionChain(pikachuChain);
    expect(result.chain.name).toBe('pichu');
    expect(result.chain.id).toBe(172);
    expect(result.chain.displayName).toBe('Pichu');
  });

  it('maps nested evolutions', () => {
    const result = mapEvolutionChain(pikachuChain);
    const pikachu = result.chain.evolvesTo[0];
    expect(pikachu.name).toBe('pikachu');
    expect(pikachu.id).toBe(25);
    const raichu = pikachu.evolvesTo[0];
    expect(raichu.name).toBe('raichu');
    expect(raichu.evolvesTo).toHaveLength(0);
  });

  it('sets sprite URLs from ID', () => {
    const result = mapEvolutionChain(pikachuChain);
    expect(result.chain.sprite).toContain('172');
  });
});

describe('mapPokemonSpecies', () => {
  it('maps genus for the requested locale', () => {
    const result = mapPokemonSpecies(pikachuSpecies, 'es');
    expect(result.genus).toBe('Ratón Pokémon');
  });

  it('falls back to English genus when locale has no entry', () => {
    const result = mapPokemonSpecies(pikachuSpecies, 'de');
    expect(result.genus).toBe('Mouse Pokémon');
  });

  it('picks flavor text for the requested locale', () => {
    const result = mapPokemonSpecies(pikachuSpecies, 'es');
    expect(result.flavorText).toContain('Pokémon se reúnen');
  });

  it('falls back to English flavor text when locale has no entry', () => {
    const result = mapPokemonSpecies(pikachuSpecies, 'de');
    expect(result.flavorText).toContain('electricity can cause lightning storms');
  });

  it('cleans form-feed and newline characters from flavor text', () => {
    const result = mapPokemonSpecies(pikachuSpecies, 'en');
    expect(result.flavorText).not.toMatch(/[\f\n]/);
  });

  it('maps egg groups, gender rate, capture rate, and base happiness', () => {
    const result = mapPokemonSpecies(pikachuSpecies, 'en');
    expect(result.eggGroups).toEqual(['field', 'fairy']);
    expect(result.genderRate).toBe(4);
    expect(result.captureRate).toBe(190);
    expect(result.baseHappiness).toBe(70);
  });
});

describe('mapMove', () => {
  it('maps all fields correctly', () => {
    const result = mapMove(thundershockMove);
    expect(result.id).toBe(84);
    expect(result.name).toBe('thundershock');
    expect(result.displayName).toBe('ThunderShock');
    expect(result.type).toBe('electric');
    expect(result.damageClass).toBe('special');
    expect(result.power).toBe(40);
    expect(result.accuracy).toBe(100);
    expect(result.pp).toBe(30);
  });

  it('falls back to formatted name when no English name entry exists', () => {
    const noEnName = { ...thundershockMove, names: [] };
    const result = mapMove(noEnName);
    expect(result.displayName).toBe('Thundershock');
  });
});
