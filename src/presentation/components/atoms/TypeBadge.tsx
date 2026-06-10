import Image from 'next/image';
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
      className={[
        'inline-flex items-center gap-1.5 rounded-md font-bold text-white',
        '[text-shadow:0_1px_2px_rgba(0,0,0,0.35)]',
        'shadow-[0_2px_4px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.18)]',
        isSmall ? 'px-2 py-1 text-xs' : 'px-3 py-[7px] text-sm',
        c.badgeBg,
      ].join(' ')}
    >
      <Image
        src={`/type-icons/${type}.svg`}
        alt=""
        width={isSmall ? 16 : 22}
        height={isSmall ? 16 : 22}
        className="shrink-0 [filter:drop-shadow(0_1px_2px_rgba(0,0,0,0.25))]"
        aria-hidden="true"
      />
      {displayLabel}
    </span>
  );
}
