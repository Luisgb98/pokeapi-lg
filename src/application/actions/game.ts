'use server';

import { getRepository } from '../container';
import { getGameChallenge, getDailySeed, type GameChallenge } from '../usecases/getGameChallenge';

export async function fetchNextChallenge(roundOffset: number): Promise<GameChallenge> {
  const repository = getRepository();
  const seed = getDailySeed() + roundOffset;
  return getGameChallenge(repository, seed);
}
