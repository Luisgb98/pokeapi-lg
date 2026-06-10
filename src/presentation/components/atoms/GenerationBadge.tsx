import { formatGeneration } from '@/presentation/lib/generationLabels';
import type { Generation } from '@/domain/entities/Pokemon';

interface GenerationBadgeProps {
  generation: Generation;
}

export function GenerationBadge({ generation }: GenerationBadgeProps) {
  return (
    <span className="inline-flex items-center rounded-full bg-stone-100 px-2.5 py-0.5 font-mono text-xs font-medium tracking-wide text-stone-500 dark:bg-stone-800 dark:text-stone-400">
      {formatGeneration(generation)}
    </span>
  );
}
