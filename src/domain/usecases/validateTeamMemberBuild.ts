import type { TeamMemberBuild } from '../entities/TeamMemberBuild';
import { NATURES } from '../data/natures';
import { IV_MAX, EV_MAX, EV_TOTAL_MAX, LEVEL_MIN, LEVEL_MAX } from './calculateStats';

export type BuildErrorCode =
  | 'ILLEGAL_ABILITY'
  | 'ILLEGAL_NATURE'
  | 'ILLEGAL_LEVEL'
  | 'ILLEGAL_IV'
  | 'ILLEGAL_EV_SINGLE'
  | 'ILLEGAL_EV_TOTAL'
  | 'TOO_MANY_MOVES'
  | 'DUPLICATE_MOVE'
  | 'ILLEGAL_MOVE';

export interface BuildError {
  readonly code: BuildErrorCode;
  readonly message: string;
}

export type BuildValidationResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly errors: readonly BuildError[] };

/** Pure legality validator. Pass legal context from the repository (ability names + move names). */
export function validateTeamMemberBuild(
  build: TeamMemberBuild,
  legalAbilityNames: readonly string[],
  legalMoveNames: readonly string[],
): BuildValidationResult {
  const errors: BuildError[] = [];

  if (!legalAbilityNames.includes(build.abilityName)) {
    errors.push({
      code: 'ILLEGAL_ABILITY',
      message: `Ability "${build.abilityName}" is not legal for this Pokémon`,
    });
  }

  if (!NATURES.some((n) => n.name === build.natureName)) {
    errors.push({
      code: 'ILLEGAL_NATURE',
      message: `Nature "${build.natureName}" is not a valid nature`,
    });
  }

  if (build.level < LEVEL_MIN || build.level > LEVEL_MAX || !Number.isInteger(build.level)) {
    errors.push({
      code: 'ILLEGAL_LEVEL',
      message: `Level must be between ${LEVEL_MIN} and ${LEVEL_MAX}`,
    });
  }

  const statKeys = ['hp', 'attack', 'defense', 'specialAttack', 'specialDefense', 'speed'] as const;

  for (const stat of statKeys) {
    const iv = build.ivs[stat];
    if (!Number.isInteger(iv) || iv < 0 || iv > IV_MAX) {
      errors.push({
        code: 'ILLEGAL_IV',
        message: `IV for ${stat} must be between 0 and ${IV_MAX}`,
      });
    }
  }

  for (const stat of statKeys) {
    const ev = build.evs[stat];
    if (!Number.isInteger(ev) || ev < 0 || ev > EV_MAX) {
      errors.push({
        code: 'ILLEGAL_EV_SINGLE',
        message: `EV for ${stat} must be between 0 and ${EV_MAX}`,
      });
    }
  }

  const evTotal = statKeys.reduce((sum, stat) => sum + (build.evs[stat] ?? 0), 0);
  if (evTotal > EV_TOTAL_MAX) {
    errors.push({
      code: 'ILLEGAL_EV_TOTAL',
      message: `Total EVs (${evTotal}) exceeds the maximum of ${EV_TOTAL_MAX}`,
    });
  }

  if (build.moveNames.length > 4) {
    errors.push({ code: 'TOO_MANY_MOVES', message: 'A Pokémon can have at most 4 moves' });
  }

  const seen = new Set<string>();
  for (const moveName of build.moveNames) {
    if (seen.has(moveName)) {
      errors.push({
        code: 'DUPLICATE_MOVE',
        message: `Move "${moveName}" appears more than once`,
      });
    }
    seen.add(moveName);
    if (!legalMoveNames.includes(moveName)) {
      errors.push({
        code: 'ILLEGAL_MOVE',
        message: `Move "${moveName}" is not in this Pokémon's learnset`,
      });
    }
  }

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true };
}
