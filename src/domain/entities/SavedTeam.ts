export interface SavedTeamMember {
  readonly slot: number;
  readonly pokemonId: number;
}

export interface SavedTeam {
  readonly id: string;
  readonly name: string;
  readonly members: readonly SavedTeamMember[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
