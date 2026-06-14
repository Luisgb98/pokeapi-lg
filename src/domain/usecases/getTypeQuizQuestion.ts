import { POKEMON_TYPES } from '../entities/Pokemon';
import type { PokemonType } from '../entities/Pokemon';
import { getTypeChart } from '../entities/typeChart';

export interface TypeQuizQuestion {
  readonly defendingTypes: readonly PokemonType[];
  readonly choices: readonly PokemonType[];
  readonly correct: PokemonType;
}

// Tuning constants
const SINGLE_TYPE_PROBABILITY = 0.5;
const SUPER_EFFECTIVE_THRESHOLD = 2;

// Intentional duplication of seededRng from application/usecases/getGameChallenge.ts;
// domain must not import application.
function seededRng(seed: number): () => number {
  let s = seed ^ 0xdeadbeef;
  return () => {
    s = Math.imul(s ^ (s >>> 16), 0x45d9f3b);
    s = Math.imul(s ^ (s >>> 16), 0x45d9f3b);
    s ^= s >>> 16;
    return (s >>> 0) / 0x100000000;
  };
}

export function getTypeQuizQuestion(seed: number, round: number): TypeQuizQuestion {
  const rng = seededRng(seed * 1000 + round);
  const chart = getTypeChart();

  let defendingTypes: readonly PokemonType[];
  let superEffective: PokemonType[];
  let notSuperEffective: PokemonType[];

  do {
    if (rng() < SINGLE_TYPE_PROBABILITY) {
      const idx = Math.floor(rng() * POKEMON_TYPES.length);
      defendingTypes = [POKEMON_TYPES[idx]];
    } else {
      const idx1 = Math.floor(rng() * POKEMON_TYPES.length);
      let idx2 = Math.floor(rng() * (POKEMON_TYPES.length - 1));
      if (idx2 >= idx1) idx2++;
      defendingTypes = [POKEMON_TYPES[idx1], POKEMON_TYPES[idx2]];
    }

    superEffective = [];
    notSuperEffective = [];

    for (const attackingType of POKEMON_TYPES) {
      const multiplier = defendingTypes.reduce((acc, def) => acc * chart[attackingType][def], 1);
      if (multiplier >= SUPER_EFFECTIVE_THRESHOLD) {
        superEffective.push(attackingType);
      } else {
        notSuperEffective.push(attackingType);
      }
    }
  } while (superEffective.length === 0 || notSuperEffective.length < 3);

  const correctIdx = Math.floor(rng() * superEffective.length);
  const correct = superEffective[correctIdx];

  const pool = [...notSuperEffective];
  const distractors: PokemonType[] = [];
  for (let i = 0; i < 3; i++) {
    const idx = Math.floor(rng() * pool.length);
    distractors.push(pool[idx]);
    pool.splice(idx, 1);
  }

  const choices: PokemonType[] = [correct, ...distractors];
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = choices[i];
    choices[i] = choices[j];
    choices[j] = tmp;
  }

  return { defendingTypes, choices, correct };
}
