'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { POKEMON_TYPES } from '@/domain/entities/Pokemon';
import type { PokemonType } from '@/domain/entities/Pokemon';
import { calculateDefenseEffectiveness } from '@/domain/usecases/calculateTypeEffectiveness';
import { TypeBadge } from '@/presentation/components/atoms/TypeBadge';
import { cn } from '@/presentation/lib/utils';

export function TypeCalculator() {
  const t = useTranslations('typeCalculator');
  const [selected, setSelected] = useState<PokemonType[]>([]);

  const toggle = (type: PokemonType) => {
    setSelected((prev) => {
      if (prev.includes(type)) return prev.filter((s) => s !== type);
      if (prev.length >= 2) return prev;
      return [...prev, type];
    });
  };

  const effectiveness = selected.length > 0 ? calculateDefenseEffectiveness(selected) : null;

  const groups = effectiveness && {
    4: POKEMON_TYPES.filter((tp) => effectiveness[tp] === 4),
    2: POKEMON_TYPES.filter((tp) => effectiveness[tp] === 2),
    0.5: POKEMON_TYPES.filter((tp) => effectiveness[tp] === 0.5),
    0.25: POKEMON_TYPES.filter((tp) => effectiveness[tp] === 0.25),
    0: POKEMON_TYPES.filter((tp) => effectiveness[tp] === 0),
  };

  const displayLabel =
    selected.length === 0
      ? t('selectPrompt')
      : selected.map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(' / ');

  return (
    <div className="space-y-5">
      {/* Type selector */}
      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-700 dark:bg-stone-900">
        <p className="mb-3 text-sm font-medium text-stone-500 dark:text-stone-400">
          {displayLabel}
        </p>
        <div className="flex flex-wrap gap-2">
          {POKEMON_TYPES.map((type) => {
            const isSelected = selected.includes(type);
            const isDisabled = !isSelected && selected.length >= 2;
            return (
              <button
                key={type}
                type="button"
                onClick={() => toggle(type)}
                disabled={isDisabled}
                aria-pressed={isSelected}
                className={cn(
                  'transition-[opacity,box-shadow]',
                  isSelected && 'ring-2 ring-offset-2 ring-stone-900 dark:ring-stone-100',
                  isDisabled && 'opacity-30',
                )}
              >
                <TypeBadge type={type} size="sm" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Results */}
      {groups && (
        <div className="space-y-3">
          {groups[0].length > 0 && <Section label={t('immune')} badge="×0" types={groups[0]} />}
          {groups[4].length > 0 && (
            <Section label={t('quadWeak')} badge="×4" types={groups[4]} accent="red" />
          )}
          {groups[2].length > 0 && (
            <Section label={t('doubleWeak')} badge="×2" types={groups[2]} accent="orange" />
          )}
          {groups[0.5].length > 0 && (
            <Section label={t('halfResist')} badge="½×" types={groups[0.5]} accent="blue" />
          )}
          {groups[0.25].length > 0 && (
            <Section label={t('quarterResist')} badge="¼×" types={groups[0.25]} accent="blue" />
          )}
        </div>
      )}
    </div>
  );
}

interface SectionProps {
  label: string;
  badge: string;
  types: PokemonType[];
  accent?: 'red' | 'orange' | 'blue';
}

function Section({ label, badge, types, accent }: SectionProps) {
  const borderMap: Record<NonNullable<typeof accent>, string> = {
    red: 'border-red-200 dark:border-red-900',
    orange: 'border-orange-200 dark:border-orange-900',
    blue: 'border-blue-200 dark:border-blue-900',
  };
  const border = accent ? borderMap[accent] : 'border-stone-200 dark:border-stone-700';

  return (
    <div className={cn('overflow-hidden rounded-2xl border bg-white dark:bg-stone-900', border)}>
      <div className="flex items-center gap-2 border-b border-stone-100 px-4 py-2.5 dark:border-stone-800">
        <span className="font-mono text-sm font-bold text-stone-700 dark:text-stone-300">
          {badge}
        </span>
        <span className="text-sm font-medium text-stone-500 dark:text-stone-400">{label}</span>
      </div>
      <div className="flex flex-wrap gap-2 p-4">
        {types.map((type) => (
          <TypeBadge key={type} type={type} size="sm" />
        ))}
      </div>
    </div>
  );
}
