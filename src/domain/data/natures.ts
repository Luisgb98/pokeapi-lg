import type { PokemonStats } from '../entities/Pokemon';

export type NatureStat = Exclude<keyof PokemonStats, 'hp'>;

export interface Nature {
  readonly name: string;
  readonly increased: NatureStat | null;
  readonly decreased: NatureStat | null;
}

export const NATURES: readonly Nature[] = [
  // Neutral natures
  { name: 'hardy', increased: null, decreased: null },
  { name: 'docile', increased: null, decreased: null },
  { name: 'serious', increased: null, decreased: null },
  { name: 'bashful', increased: null, decreased: null },
  { name: 'quirky', increased: null, decreased: null },
  // +Attack natures
  { name: 'lonely', increased: 'attack', decreased: 'defense' },
  { name: 'brave', increased: 'attack', decreased: 'speed' },
  { name: 'adamant', increased: 'attack', decreased: 'specialAttack' },
  { name: 'naughty', increased: 'attack', decreased: 'specialDefense' },
  // +Defense natures
  { name: 'bold', increased: 'defense', decreased: 'attack' },
  { name: 'relaxed', increased: 'defense', decreased: 'speed' },
  { name: 'impish', increased: 'defense', decreased: 'specialAttack' },
  { name: 'lax', increased: 'defense', decreased: 'specialDefense' },
  // +Speed natures
  { name: 'timid', increased: 'speed', decreased: 'attack' },
  { name: 'hasty', increased: 'speed', decreased: 'defense' },
  { name: 'jolly', increased: 'speed', decreased: 'specialAttack' },
  { name: 'naive', increased: 'speed', decreased: 'specialDefense' },
  // +Special Attack natures
  { name: 'modest', increased: 'specialAttack', decreased: 'attack' },
  { name: 'mild', increased: 'specialAttack', decreased: 'defense' },
  { name: 'quiet', increased: 'specialAttack', decreased: 'speed' },
  { name: 'rash', increased: 'specialAttack', decreased: 'specialDefense' },
  // +Special Defense natures
  { name: 'calm', increased: 'specialDefense', decreased: 'attack' },
  { name: 'gentle', increased: 'specialDefense', decreased: 'defense' },
  { name: 'sassy', increased: 'specialDefense', decreased: 'speed' },
  { name: 'careful', increased: 'specialDefense', decreased: 'specialAttack' },
];

export function getNature(name: string): Nature | undefined {
  return NATURES.find((n) => n.name === name);
}
