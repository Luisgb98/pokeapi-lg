export interface PokemonSpecies {
  readonly genus: string;
  readonly flavorText: string;
  readonly eggGroups: readonly string[];
  /** -1 = genderless; 0–8 = eighths of the chance to be female */
  readonly genderRate: number;
  readonly captureRate: number;
  readonly baseHappiness: number;
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

export function formatEggGroupName(name: string): string {
  return (
    EGG_GROUP_DISPLAY[name] ??
    name
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
  );
}
