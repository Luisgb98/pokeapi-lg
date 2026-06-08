import type { PokemonType } from './Pokemon';

export type DamageClass = 'physical' | 'special' | 'status';
export type LearnMethod = 'level-up' | 'machine' | 'egg' | 'tutor';

export const LEARN_METHODS: readonly LearnMethod[] = ['level-up', 'machine', 'egg', 'tutor'];

export interface Move {
  readonly id: number;
  readonly name: string;
  readonly displayName: string;
  readonly type: PokemonType;
  readonly damageClass: DamageClass;
  readonly power: number | null;
  readonly accuracy: number | null;
  readonly pp: number;
}

export interface LearnedMove {
  readonly move: Move;
  readonly learnMethod: LearnMethod;
  readonly levelLearnedAt: number;
}
