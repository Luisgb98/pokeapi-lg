'use client';

import Image from 'next/image';
import Link from 'next/link';
import { TypeBadge } from '@/components/atoms/TypeBadge';
import { getPrimaryTypeColor } from '@/lib/typeColors';
import type { PokemonSummary } from '@/domain/entities/Pokemon';

interface PokemonCardProps {
  pokemon: PokemonSummary;
  index?: number;
}

export function PokemonCard({ pokemon, index = 0 }: PokemonCardProps) {
  const primaryColor = getPrimaryTypeColor(pokemon.types);
  const formattedId = `#${String(pokemon.id).padStart(4, '0')}`;

  return (
    <Link
      href={`/pokemon/${pokemon.id}`}
      className="pokemon-card group block animate-fade-in-up focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900"
      style={
        {
          animationDelay: `${Math.min(index * 40, 600)}ms`,
          '--hover-shadow': `0 16px 40px ${primaryColor.shadow}, 0 4px 12px rgba(0,0,0,0.06)`,
          '--hover-border': primaryColor.accent,
        } as React.CSSProperties
      }
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.boxShadow = `0 16px 40px ${primaryColor.shadow}, 0 4px 12px rgba(0,0,0,0.06)`;
        el.style.borderColor = `${primaryColor.accent}60`;
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.boxShadow = '';
        el.style.borderColor = '';
      }}
    >
      {/* Background tint on hover */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ backgroundColor: `${primaryColor.accent}06` }}
      />

      <div className="relative flex flex-col items-center px-4 pt-5 pb-4">
        {/* ID badge */}
        <span className="absolute left-3 top-3 font-mono text-xs font-medium tracking-wider text-stone-400">
          {formattedId}
        </span>

        {/* Arrow indicator */}
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

        {/* Artwork */}
        <div className="relative mb-3 size-28 transition-transform duration-300 group-hover:scale-105">
          <Image
            src={pokemon.sprite}
            alt={pokemon.displayName}
            fill
            sizes="112px"
            className="object-contain drop-shadow-sm"
            loading="lazy"
          />
        </div>

        {/* Name */}
        <h3
          className="mb-2 text-center font-display text-base font-bold tracking-tight text-stone-900"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {pokemon.displayName}
        </h3>

        {/* Type badges */}
        <div className="flex flex-wrap justify-center gap-1">
          {pokemon.types.map((t) => (
            <TypeBadge key={t} type={t} size="sm" />
          ))}
        </div>
      </div>

      {/* Type color strip */}
      <div
        className="h-1 w-full transition-all duration-300"
        style={{ backgroundColor: primaryColor.accent, opacity: 0.7 }}
      />
    </Link>
  );
}
