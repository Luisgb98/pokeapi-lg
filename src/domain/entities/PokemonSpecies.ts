export interface PokemonVariety {
  readonly id: number;
  readonly name: string;
  readonly displayName: string;
  readonly isDefault: boolean;
}

export interface PokemonSpecies {
  /** Species name in the requested locale; falls back to English, then the formatted slug. */
  readonly localizedName: string;
  readonly genus: string;
  readonly flavorText: string;
  readonly eggGroups: readonly string[];
  /** -1 = genderless; 0–8 = eighths of the chance to be female */
  readonly genderRate: number;
  readonly captureRate: number;
  readonly baseHappiness: number;
  readonly varieties: readonly PokemonVariety[];
}

/** Returns female percentage (0–100), or null for genderless. */
export function getFemalePercent(genderRate: number): number | null {
  if (genderRate === -1) return null;
  return (genderRate / 8) * 100;
}

const EGG_GROUP_DISPLAY: Record<string, string> = {
  monster: 'Monster',
  water1: 'Water 1',
  water2: 'Water 2',
  water3: 'Water 3',
  bug: 'Bug',
  flying: 'Flying',
  field: 'Field',
  fairy: 'Fairy',
  grass: 'Grass',
  'human-like': 'Human-Like',
  'water-body': 'Water Body',
  mineral: 'Mineral',
  amorphous: 'Amorphous',
  ditto: 'Ditto',
  dragon: 'Dragon',
  undiscovered: 'Undiscovered',
};

/** Derives a human-readable label for an alternate form, stripping the base Pokémon name. */
export function formatVarietyDisplayName(baseName: string, varietyName: string): string {
  if (varietyName === baseName) return 'Default';
  const suffix = varietyName.startsWith(`${baseName}-`)
    ? varietyName.slice(baseName.length + 1)
    : varietyName;
  return suffix
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function formatEggGroupName(name: string): string {
  return (
    EGG_GROUP_DISPLAY[name] ??
    name
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
  );
}
