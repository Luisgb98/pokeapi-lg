import { describe, expect, it } from 'vitest';
import {
  mapAbility,
  mapEvolutionChain,
  mapMove,
  mapPokemon,
  mapPokemonSpecies,
  mapPokemonSummary,
} from '../../infrastructure/pokeapi/mappers';
import {
  bulbasaurRaw,
  lightningRodAbility,
  pikachuChain,
  pikachuRaw,
  pikachuSpecies,
  staticAbility,
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
        other: { 'official-artwork': { front_default: null, front_shiny: null } },
      },
    };
    const result = mapPokemon(noArtwork, 10);
    expect(result.artwork).toContain('official-artwork');
  });

  it('maps shinyArtwork from sprites when available', () => {
    const result = mapPokemon(pikachuRaw, 10);
    expect(result.shinyArtwork).toBe('https://artwork.pokemon.com/shiny/pikachu.png');
  });

  it('maps height and weight from raw', () => {
    const result = mapPokemon(pikachuRaw, 10);
    expect(result.height).toBe(4);
    expect(result.weight).toBe(60);
  });

  it('maps abilities sorted by slot with isHidden preserved', () => {
    const result = mapPokemon(pikachuRaw, 10);
    expect(result.abilities).toEqual([
      { name: 'static', isHidden: false },
      { name: 'lightning-rod', isHidden: true },
    ]);
  });

  it('falls back to computed shiny artwork URL when sprites shiny field is null', () => {
    const noShiny = {
      ...pikachuRaw,
      sprites: {
        ...pikachuRaw.sprites,
        other: {
          'official-artwork': {
            front_default: pikachuRaw.sprites.other['official-artwork'].front_default,
            front_shiny: null,
          },
        },
      },
    };
    const result = mapPokemon(noShiny, 10);
    expect(result.shinyArtwork).toContain('shiny');
    expect(result.shinyArtwork).toContain('25');
  });

  it('defaults missing stats to 0', () => {
    const noStats = { ...pikachuRaw, stats: [] };
    const result = mapPokemon(noStats, 10);
    expect(result.stats.hp).toBe(0);
    expect(result.stats.attack).toBe(0);
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
  it('returns localizedName from the matching locale entry', () => {
    const result = mapPokemonSpecies(pikachuSpecies, 'de');
    expect(result.localizedName).toBe('Pikachu');
  });

  it('falls back to English localizedName when locale has no names entry', () => {
    const result = mapPokemonSpecies(pikachuSpecies, 'pt');
    expect(result.localizedName).toBe('Pikachu');
  });

  it('falls back to formatted slug for localizedName when names array is empty', () => {
    const noNames = { ...pikachuSpecies, names: [] };
    const result = mapPokemonSpecies(noNames, 'en');
    expect(result.localizedName).toBe('Pikachu');
  });

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

  it('maps varieties with id, name, displayName, and isDefault', () => {
    const result = mapPokemonSpecies(pikachuSpecies, 'en');
    expect(result.varieties).toHaveLength(1);
    expect(result.varieties[0]).toMatchObject({
      id: 25,
      name: 'pikachu',
      displayName: 'Default',
      isDefault: true,
    });
  });
});

describe('mapAbility', () => {
  it('maps localized display name for the given locale', () => {
    const result = mapAbility(staticAbility, false, 'de');
    expect(result.displayName).toBe('Statik');
  });

  it('falls back to English name when locale has no entry', () => {
    const result = mapAbility(staticAbility, false, 'pt');
    expect(result.displayName).toBe('Static');
  });

  it('maps localized flavor text for the given locale', () => {
    const result = mapAbility(staticAbility, false, 'de');
    expect(result.effect).toContain('lähmen');
  });

  it('falls back to English flavor text when locale has no entry', () => {
    const result = mapAbility(lightningRodAbility, true, 'pt');
    expect(result.effect).toContain('Electric-type');
  });

  it('cleans whitespace characters from flavor text', () => {
    const result = mapAbility(staticAbility, false, 'en');
    expect(result.effect).not.toMatch(/[\f\n]/);
  });

  it('maps isHidden correctly', () => {
    expect(mapAbility(staticAbility, false, 'en').isHidden).toBe(false);
    expect(mapAbility(lightningRodAbility, true, 'en').isHidden).toBe(true);
  });

  it('falls back to formatted slug when no names exist', () => {
    const noNames = { ...staticAbility, names: [] };
    const result = mapAbility(noNames, false, 'en');
    expect(result.displayName).toBe('Static');
  });

  it('returns empty string for effect when no flavor text entries exist', () => {
    const noFlavors = { ...staticAbility, flavor_text_entries: [] };
    const result = mapAbility(noFlavors, false, 'en');
    expect(result.effect).toBe('');
  });
});

describe('mapMove', () => {
  it('maps all fields correctly', () => {
    const result = mapMove(thundershockMove, 'en');
    expect(result.id).toBe(84);
    expect(result.name).toBe('thundershock');
    expect(result.displayName).toBe('ThunderShock');
    expect(result.type).toBe('electric');
    expect(result.damageClass).toBe('special');
    expect(result.power).toBe(40);
    expect(result.accuracy).toBe(100);
    expect(result.pp).toBe(30);
  });

  it('returns the localized name when a matching locale entry exists', () => {
    const result = mapMove(thundershockMove, 'de');
    expect(result.displayName).toBe('Donnerschock');
  });

  it('falls back to English name when locale has no entry', () => {
    const result = mapMove(thundershockMove, 'pt');
    expect(result.displayName).toBe('ThunderShock');
  });

  it('falls back to formatted name when no English name entry exists', () => {
    const noEnName = { ...thundershockMove, names: [] };
    const result = mapMove(noEnName, 'en');
    expect(result.displayName).toBe('Thundershock');
  });
});
