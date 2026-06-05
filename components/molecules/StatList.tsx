import { StatBar } from '@/components/atoms/StatBar';
import type { PokemonStats } from '@/domain/entities/Pokemon';

interface StatListProps {
  stats: PokemonStats;
}

const STAT_ORDER: (keyof PokemonStats)[] = [
  'hp',
  'attack',
  'defense',
  'specialAttack',
  'specialDefense',
  'speed',
];

export function StatList({ stats }: StatListProps) {
  return (
    <div className="flex flex-col gap-3">
      {STAT_ORDER.map((key) => (
        <StatBar key={key} statKey={key} value={stats[key]} />
      ))}
    </div>
  );
}
