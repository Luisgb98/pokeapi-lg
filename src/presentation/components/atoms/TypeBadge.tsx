import { TYPE_CLASSES } from '@/presentation/lib/typeColors';
import type { PokemonType } from '@/domain/entities/Pokemon';

interface TypeBadgeProps {
  type: PokemonType;
  size?: 'sm' | 'md';
  label?: string;
}

export function TypeBadge({ type, size = 'md', label }: TypeBadgeProps) {
  const c = TYPE_CLASSES[type];
  const isSmall = size === 'sm';
  const displayLabel = label ?? type.charAt(0).toUpperCase() + type.slice(1);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${isSmall ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'} ${c.badgeBg} ${c.badgeText} ${c.badgeBorder}`}
    >
      <span
        className={`inline-block shrink-0 rounded-full ${isSmall ? 'h-1.5 w-1.5' : 'h-2 w-2'} ${c.accentBg}`}
      />
      {displayLabel}
    </span>
  );
}
