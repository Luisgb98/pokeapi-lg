'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { FavoriteButton } from '@/presentation/components/atoms/FavoriteButton';
import { TypeBadge } from '@/presentation/components/atoms/TypeBadge';
import { cardVariants } from '@/presentation/components/ui/card-variants';
import { useHydration } from '@/presentation/hooks/useHydration';
import { getPrimaryTypeClasses } from '@/presentation/lib/typeColors';
import { cn } from '@/presentation/lib/utils';
import { useFavoritesStore } from '@/presentation/store/favoritesStore';
import type { PokemonSummary } from '@/domain/entities/Pokemon';

interface PokemonCardProps {
  pokemon: PokemonSummary;
  index?: number;
  onClick?: () => void;
  animate?: boolean;
}

export function PokemonCard({ pokemon, index = 0, onClick, animate = true }: PokemonCardProps) {
  const tTypes = useTranslations('types');
  const tFav = useTranslations('favorites');
  const tc = getPrimaryTypeClasses(pokemon.types);
  const formattedId = `#${String(pokemon.id).padStart(4, '0')}`;
  const hydrated = useHydration();
  const { isFavorite, toggle } = useFavoritesStore();

  return (
    <Link
      href={`/pokemon/${pokemon.id}`}
      onClick={onClick}
      className={cn(
        cardVariants({ variant: 'pokemon' }),
        'group flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900',
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

      <div className="relative flex flex-1 flex-col items-center px-4 pb-4 pt-5">
        <span className="absolute left-3 top-3 font-mono text-xs font-medium tracking-wider text-stone-400">
          {formattedId}
        </span>

        {hydrated && (
          <span className="absolute right-2 top-2 z-10">
            <FavoriteButton
              size="sm"
              isFavorite={isFavorite(pokemon.id)}
              label={
                isFavorite(pokemon.id)
                  ? tFav('remove', { name: pokemon.displayName })
                  : tFav('add', { name: pokemon.displayName })
              }
              onToggle={(e) => {
                e.preventDefault();
                toggle(pokemon.id);
              }}
            />
          </span>
        )}

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

        <div className="mt-auto flex flex-wrap justify-center gap-1 pt-2 min-h-[2.75rem] content-start">
          {pokemon.types.map((t) => (
            <TypeBadge key={t} type={t} size="sm" label={tTypes(t)} />
          ))}
        </div>
      </div>

      <div className={`h-1 w-full opacity-70 ${tc.accentBg}`} />
    </Link>
  );
}
