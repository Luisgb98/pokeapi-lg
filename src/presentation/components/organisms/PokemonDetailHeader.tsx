'use client';

import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { ArrowLeft } from 'lucide-react';
import { FavoriteButton } from '@/presentation/components/atoms/FavoriteButton';
import { GenerationBadge } from '@/presentation/components/atoms/GenerationBadge';
import { TypeBadge } from '@/presentation/components/atoms/TypeBadge';
import { ShinyFormSwitcher } from '@/presentation/components/molecules/ShinyFormSwitcher';
import { useHydration } from '@/presentation/hooks/useHydration';
import { getOfficialArtworkUrl, getShinyArtworkUrl } from '@/domain/entities/Pokemon';
import { getPrimaryTypeClasses } from '@/presentation/lib/typeColors';
import { useFavoritesStore } from '@/presentation/store/favoritesStore';
import { usePokemonFormById } from '@/presentation/queries/pokemonQueries';
import { fetchPokemonFormById } from '@/application/actions/pokemon';
import { pokemonFormQueryKey } from '@/presentation/lib/queryKeys';
import type { Pokemon } from '@/domain/entities/Pokemon';
import type { PokemonVariety } from '@/domain/entities/PokemonSpecies';

interface PokemonDetailHeaderProps {
  pokemon: Pokemon;
  backTo?: string;
  varieties?: readonly PokemonVariety[];
}

export function PokemonDetailHeader({ pokemon, backTo, varieties = [] }: PokemonDetailHeaderProps) {
  const tNav = useTranslations('nav');
  const tTypes = useTranslations('types');
  const tFav = useTranslations('favorites');
  const tForms = useTranslations('forms');

  const [isShiny, setIsShiny] = useState(false);
  const [selectedFormId, setSelectedFormId] = useState(pokemon.id);

  const hydrated = useHydration();
  const { isFavorite, toggle } = useFavoritesStore();
  const queryClient = useQueryClient();

  const isFormChanged = selectedFormId !== pokemon.id;
  const { data: formData } = usePokemonFormById(isFormChanged ? selectedFormId : null);

  const currentPokemon = formData ?? pokemon;
  const displayArtwork = isShiny ? currentPokemon.shinyArtwork : currentPokemon.artwork;

  // Prefetch all alternate-form data and preload their artwork images on mount
  // so form + shiny switching is instant with no blank-frame flash.
  useEffect(() => {
    const altForms = varieties.filter((v) => v.id !== pokemon.id);
    for (const variety of altForms) {
      void queryClient.prefetchQuery({
        queryKey: pokemonFormQueryKey(variety.id),
        queryFn: () => fetchPokemonFormById(variety.id),
        staleTime: Infinity,
      });
      new window.Image().src = getOfficialArtworkUrl(variety.id);
      new window.Image().src = getShinyArtworkUrl(variety.id);
    }
    new window.Image().src = getShinyArtworkUrl(pokemon.id);
  }, [varieties, pokemon.id, queryClient]);

  // Only commit the new src once the browser has finished loading the image,
  // so the displayed image never goes through a blank state mid-transition.
  const [committedArtwork, setCommittedArtwork] = useState(displayArtwork);
  useEffect(() => {
    if (displayArtwork === committedArtwork) return;
    const img = new window.Image();
    img.src = displayArtwork;
    if (img.complete) {
      setCommittedArtwork(displayArtwork);
      return;
    }
    const settle = () => setCommittedArtwork(displayArtwork);
    img.addEventListener('load', settle);
    img.addEventListener('error', settle);
    return () => {
      img.removeEventListener('load', settle);
      img.removeEventListener('error', settle);
    };
  }, [displayArtwork, committedArtwork]);

  const tc = getPrimaryTypeClasses(currentPokemon.types);
  const formattedId = `#${String(pokemon.id).padStart(4, '0')}`;

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
              key={committedArtwork}
              src={committedArtwork}
              alt={currentPokemon.displayName}
              fill
              sizes="(max-width: 640px) 208px, 256px"
              className={`animate-fade-in object-contain transition-[filter] duration-300 ${isShiny ? 'drop-shadow-[0_0_22px_rgba(251,191,36,0.55)]' : 'drop-shadow-lg'}`}
              priority
            />
            {isShiny && (
              <>
                <span
                  style={{ '--sparkle-delay': '0ms' } as React.CSSProperties}
                  className="animate-sparkle-rise pointer-events-none absolute right-5 top-3 select-none text-lg text-amber-400"
                >
                  ✦
                </span>
                <span
                  style={{ '--sparkle-delay': '600ms' } as React.CSSProperties}
                  className="animate-sparkle-rise pointer-events-none absolute left-4 top-10 select-none text-sm text-yellow-300"
                >
                  ★
                </span>
                <span
                  style={{ '--sparkle-delay': '1200ms' } as React.CSSProperties}
                  className="animate-sparkle-rise pointer-events-none absolute bottom-14 right-3 select-none text-xs text-amber-300"
                >
                  ✦
                </span>
                <span
                  style={{ '--sparkle-delay': '300ms' } as React.CSSProperties}
                  className="animate-sparkle-rise pointer-events-none absolute bottom-10 left-5 select-none text-base text-yellow-400"
                >
                  ★
                </span>
              </>
            )}
          </div>

          <div className="mt-4 text-center sm:mt-0 sm:pb-4 sm:text-left">
            <p className="mb-1 font-mono text-sm font-medium tracking-widest text-stone-400">
              {formattedId}
            </p>
            <div className="mb-3 flex items-center justify-center gap-2 sm:justify-start">
              <h1 className="font-display text-4xl font-black tracking-tight text-stone-900 sm:text-5xl">
                {currentPokemon.displayName}
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
            <div className="mb-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              {currentPokemon.types.map((t) => (
                <TypeBadge key={t} type={t} label={tTypes(t)} />
              ))}
              <GenerationBadge generation={pokemon.generation} />
            </div>
            <ShinyFormSwitcher
              isShiny={isShiny}
              onShinyToggle={() => setIsShiny((s) => !s)}
              varieties={varieties}
              selectedFormId={selectedFormId}
              onFormChange={(id) => {
                setSelectedFormId(id);
                setIsShiny(false);
              }}
              labels={{
                shiny: tForms('shiny'),
                selectForm: tForms('selectForm'),
              }}
            />
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
