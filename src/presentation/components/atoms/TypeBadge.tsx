import { TYPE_CLASSES } from '@/presentation/lib/typeColors';
import type { PokemonType } from '@/domain/entities/Pokemon';

const TYPE_ICONS: Record<PokemonType, string> = {
  normal: '⚪',
  fire: '🔥',
  water: '💧',
  electric: '⚡',
  grass: '🌿',
  ice: '❄️',
  fighting: '🥊',
  poison: '☠️',
  ground: '🌍',
  flying: '🌬️',
  psychic: '🔮',
  bug: '🐛',
  rock: '🪨',
  ghost: '👻',
  dragon: '🐉',
  dark: '🌑',
  steel: '⚙️',
  fairy: '✨',
};

interface TypeBadgeProps {
  type: PokemonType;
  size?: 'sm' | 'md';
}

export function TypeBadge({ type, size = 'md' }: TypeBadgeProps) {
  const c = TYPE_CLASSES[type];
  const isSmall = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-medium capitalize ${isSmall ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'} ${c.badgeBg} ${c.badgeText} ${c.badgeBorder}`}
    >
      <span className={isSmall ? 'text-xs' : 'text-sm'}>{TYPE_ICONS[type]}</span>
      {type}
    </span>
  );
}
