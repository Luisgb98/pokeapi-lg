'use client';

import { Sparkles } from 'lucide-react';
import { cn } from '@/presentation/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/select';
import type { PokemonVariety } from '@/domain/entities/PokemonSpecies';

interface ShinyFormSwitcherProps {
  isShiny: boolean;
  onShinyToggle: () => void;
  varieties: readonly PokemonVariety[];
  selectedFormId: number;
  onFormChange: (id: number) => void;
  labels: {
    shiny: string;
    selectForm: string;
  };
}

export function ShinyFormSwitcher({
  isShiny,
  onShinyToggle,
  varieties,
  selectedFormId,
  onFormChange,
  labels,
}: ShinyFormSwitcherProps) {
  const hasMultipleForms = varieties.length > 1;

  return (
    <div className="flex items-center justify-center gap-2 sm:justify-start">
      {hasMultipleForms && (
        <Select value={String(selectedFormId)} onValueChange={(v) => onFormChange(Number(v))}>
          <SelectTrigger
            size="sm"
            className="h-8 rounded-xl border-stone-200 bg-white text-xs font-medium text-stone-700 shadow-sm hover:bg-stone-50 focus:ring-stone-900/20"
          >
            <SelectValue placeholder={labels.selectForm} />
          </SelectTrigger>
          <SelectContent position="popper" align="start" className="rounded-xl border-stone-200">
            {varieties.map((v) => (
              <SelectItem key={v.id} value={String(v.id)}>
                {v.displayName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <button
        type="button"
        onClick={onShinyToggle}
        aria-label={labels.shiny}
        aria-pressed={isShiny}
        className={cn(
          'flex h-8 items-center gap-1.5 rounded-xl px-3 text-xs font-medium transition-all',
          isShiny
            ? 'border border-amber-400 bg-amber-400 text-amber-950 shadow-sm'
            : 'border border-stone-200 bg-white text-stone-600 shadow-sm hover:bg-stone-50',
        )}
      >
        <Sparkles className={cn('size-3.5', isShiny && 'animate-pulse')} />
        <span>{labels.shiny}</span>
      </button>
    </div>
  );
}
