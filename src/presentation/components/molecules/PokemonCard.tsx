import Image from 'next/image';
import Link from 'next/link';
import { TypeBadge } from '@/presentation/components/atoms/TypeBadge';
import { cardVariants } from '@/presentation/components/ui/card';
import { getPrimaryTypeClasses } from '@/presentation/lib/typeColors';
import { cn } from '@/presentation/lib/utils';
import type { PokemonSummary } from '@/domain/entities/Pokemon';

interface PokemonCardProps {
  pokemon: PokemonSummary;
  index?: number;
  onClick?: () => void;
  animate?: boolean;
}

export function PokemonCard({ pokemon, index = 0, onClick, animate = true }: PokemonCardProps) {
  const tc = getPrimaryTypeClasses(pokemon.types);
  const formattedId = `#${String(pokemon.id).padStart(4, '0')}`;

  return (
    <Link
      href={`/pokemon/${pokemon.id}`}
      onClick={onClick}
      className={cn(
        cardVariants({ variant: 'pokemon' }),
        'group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900',
        animate && 'animate-fade-in-up',
      )}
      style={
        animate
          ? ({ '--delay': `${Math.min(index * 40, 600)}ms` } as React.CSSProperties)
          : undefined
      }
    >
      <div
        className={`absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${tc.tintBg}`}
      />

      <div className="relative flex flex-col items-center px-4 pb-4 pt-5">
        <span className="absolute left-3 top-3 font-mono text-xs font-medium tracking-wider text-stone-400">
          {formattedId}
        </span>

        <span className="absolute right-3 top-3 translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100">
          <svg
            className="size-3.5 text-stone-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </span>

        <div className="relative mb-3 size-28 transition-transform duration-300 group-hover:scale-105">
          <Image
            src={pokemon.sprite}
            alt={pokemon.displayName}
            fill
            sizes="112px"
            className="object-contain drop-shadow-sm"
            priority={index < 12}
            loading={index < 12 ? undefined : 'lazy'}
          />
        </div>

        <h3 className="mb-2 text-center font-display text-base font-bold tracking-tight text-stone-900">
          {pokemon.displayName}
        </h3>

        <div className="flex flex-wrap justify-center gap-1">
          {pokemon.types.map((t) => (
            <TypeBadge key={t} type={t} size="sm" />
          ))}
        </div>
      </div>

      <div className={`h-1 w-full opacity-70 ${tc.accentBg}`} />
    </Link>
  );
}
