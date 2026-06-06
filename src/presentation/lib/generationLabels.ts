import { GENERATIONS, type Generation } from '@/domain/entities/Pokemon';

export const GENERATION_LABELS: Record<Generation, string> = {
  'generation-i': 'Gen I',
  'generation-ii': 'Gen II',
  'generation-iii': 'Gen III',
  'generation-iv': 'Gen IV',
  'generation-v': 'Gen V',
  'generation-vi': 'Gen VI',
  'generation-vii': 'Gen VII',
  'generation-viii': 'Gen VIII',
  'generation-ix': 'Gen IX',
};

export const GENERATION_OPTIONS = GENERATIONS.map((gen) => ({
  value: gen,
  label: GENERATION_LABELS[gen],
}));

export function formatGeneration(gen: Generation): string {
  return GENERATION_LABELS[gen];
}
