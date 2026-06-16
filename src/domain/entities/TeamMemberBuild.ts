import type { PokemonStats } from './Pokemon';

export interface TeamMemberBuild {
  readonly abilityName: string;
  readonly natureName: string;
  readonly level: number;
  readonly ivs: PokemonStats;
  readonly evs: PokemonStats;
  readonly moveNames: readonly string[];
}
