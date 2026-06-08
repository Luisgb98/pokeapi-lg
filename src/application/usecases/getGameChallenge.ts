import type { PokemonSummary } from '@/domain/entities/Pokemon';
import type { PokemonRepository } from '@/domain/ports/PokemonRepository';

export interface GameChallenge {
  readonly correct: PokemonSummary;
  readonly choices: readonly PokemonSummary[];
  readonly seed: number;
}

export function getDailySeed(): number {
  const d = new Date();
  return Math.floor(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) / 86_400_000);
}

function seededRng(seed: number): () => number {
  let s = seed ^ 0xdeadbeef;
  return () => {
    s = Math.imul(s ^ (s >>> 16), 0x45d9f3b);
    s = Math.imul(s ^ (s >>> 16), 0x45d9f3b);
    s ^= s >>> 16;
    return (s >>> 0) / 0x100000000;
  };
}

export async function getGameChallenge(
  repository: PokemonRepository,
  seed: number,
): Promise<GameChallenge> {
  const { total } = await repository.findAll(undefined, { offset: 0, limit: 0 });
  const rng = seededRng(seed);

  const indices = new Set<number>();
  while (indices.size < 4) {
    indices.add(Math.floor(rng() * total));
  }

  const pokemon = (
    await Promise.all(
      [...indices].map((offset) =>
        repository.findAll(undefined, { offset, limit: 1 }).then((p) => p.items[0]),
      ),
    )
  ).filter((p): p is PokemonSummary => p !== undefined);

  if (pokemon.length < 4) {
    throw new Error('Not enough Pokémon for game challenge');
  }

  const [correct] = pokemon;
  const choices = [...pokemon];
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = choices[i];
    choices[i] = choices[j];
    choices[j] = tmp;
  }

  return { correct, choices, seed };
}
