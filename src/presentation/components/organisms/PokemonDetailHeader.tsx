'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { ArrowLeft } from 'lucide-react';
import { FavoriteButton } from '@/presentation/components/atoms/FavoriteButton';
import { GenerationBadge } from '@/presentation/components/atoms/GenerationBadge';
import { TypeBadge } from '@/presentation/components/atoms/TypeBadge';
import { useHydration } from '@/presentation/hooks/useHydration';
import { getPrimaryTypeClasses } from '@/presentation/lib/typeColors';
import { useFavoritesStore } from '@/presentation/store/favoritesStore';
import type { Pokemon } from '@/domain/entities/Pokemon';

interface PokemonDetailHeaderProps {
  pokemon: Pokemon;
  backTo?: string;
}

export function PokemonDetailHeader({ pokemon, backTo }: PokemonDetailHeaderProps) {
  const tNav = useTranslations('nav');
  const tTypes = useTranslations('types');
  const tFav = useTranslations('favorites');
  const tc = getPrimaryTypeClasses(pokemon.types);
  const formattedId = `#${String(pokemon.id).padStart(4, '0')}`;
  const hydrated = useHydration();
  const { isFavorite, toggle } = useFavoritesStore();

  const backHref = backTo === 'team' ? '/team' : '/';
  const backLabel = backTo === 'team' ? tNav('teamBuilder') : tNav('pokedex');

  return (
    <div className="relative overflow-hidden">
      <div className={`relative pb-8 pt-6 ${tc.gradientBg}`}>
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium text-stone-600 transition-colors hover:bg-white/60 hover:text-stone-900"
          >
            <ArrowLeft className="size-4" />
            <span>{backLabel}</span>
          </Link>
        </div>

        <div className="mx-auto flex max-w-5xl flex-col items-center px-4 pt-4 sm:flex-row sm:items-end sm:gap-8 sm:px-6 lg:px-8">
          <div className="relative size-52 shrink-0 animate-float sm:size-64">
            <Image
              src={pokemon.artwork}
              alt={pokemon.displayName}
              fill
              sizes="(max-width: 640px) 208px, 256px"
              className="object-contain drop-shadow-lg"
              priority
            />
          </div>

          <div className="mt-4 text-center sm:mt-0 sm:pb-4 sm:text-left">
            <p className="mb-1 font-mono text-sm font-medium tracking-widest text-stone-400">
              {formattedId}
            </p>
            <div className="mb-3 flex items-center justify-center gap-2 sm:justify-start">
              <h1 className="font-display text-4xl font-black tracking-tight text-stone-900 sm:text-5xl">
                {pokemon.displayName}
              </h1>
              {hydrated && (
                <FavoriteButton
                  isFavorite={isFavorite(pokemon.id)}
                  label={
                    isFavorite(pokemon.id)
                      ? tFav('remove', { name: pokemon.displayName })
                      : tFav('add', { name: pokemon.displayName })
                  }
                  onToggle={() => toggle(pokemon.id)}
                  className="shrink-0"
                />
              )}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              {pokemon.types.map((t) => (
                <TypeBadge key={t} type={t} label={tTypes(t)} />
              ))}
              <GenerationBadge generation={pokemon.generation} />
            </div>
          </div>
        </div>

        <div
          className={`pointer-events-none absolute -right-16 -top-16 size-64 rounded-full opacity-10 ${tc.accentBg}`}
        />
        <div
          className={`pointer-events-none absolute -bottom-8 right-8 size-32 rounded-full opacity-5 ${tc.accentBg}`}
        />
      </div>
    </div>
  );
}
