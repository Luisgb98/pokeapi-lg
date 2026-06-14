'use client';

import { useState } from 'react';
import { useRouter, usePathname } from '@/i18n/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/select';
import { NATURES } from '@/domain/data/natures';
import type { Nature } from '@/domain/data/natures';
import {
  calculateAllStats,
  IV_MAX,
  EV_MAX,
  EV_TOTAL_MAX,
  LEVEL_MIN,
  LEVEL_MAX,
} from '@/domain/usecases/calculateStats';
import type { PokemonStats } from '@/domain/entities/Pokemon';

interface StatCalculatorLabels {
  level: string;
  nature: string;
  base: string;
  iv: string;
  ev: string;
  result: string;
  evTotal: string;
  evWarning: string;
  pokemonId: string;
  load: string;
  statHp: string;
  statAttack: string;
  statDefense: string;
  statSpecialAttack: string;
  statSpecialDefense: string;
  statSpeed: string;
}

interface PokemonProp {
  id: number;
  displayName: string;
  stats: PokemonStats;
}

interface Props {
  pokemon: PokemonProp;
  labels: StatCalculatorLabels;
}

const STAT_ROWS: Array<{
  key: keyof PokemonStats;
  labelKey: keyof StatCalculatorLabels;
}> = [
  { key: 'hp', labelKey: 'statHp' },
  { key: 'attack', labelKey: 'statAttack' },
  { key: 'defense', labelKey: 'statDefense' },
  { key: 'specialAttack', labelKey: 'statSpecialAttack' },
  { key: 'specialDefense', labelKey: 'statSpecialDefense' },
  { key: 'speed', labelKey: 'statSpeed' },
];

const HARDY = NATURES.find((n) => n.name === 'hardy')!;

const DEFAULT_IVS: PokemonStats = {
  hp: IV_MAX,
  attack: IV_MAX,
  defense: IV_MAX,
  specialAttack: IV_MAX,
  specialDefense: IV_MAX,
  speed: IV_MAX,
};

const DEFAULT_EVS: PokemonStats = {
  hp: 0,
  attack: 0,
  defense: 0,
  specialAttack: 0,
  specialDefense: 0,
  speed: 0,
};

export function StatCalculator({ pokemon, labels }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const [level, setLevel] = useState(50);
  const [nature, setNature] = useState<Nature>(HARDY);
  const [ivs, setIvs] = useState<PokemonStats>(DEFAULT_IVS);
  const [evs, setEvs] = useState<PokemonStats>(DEFAULT_EVS);
  const [pokemonIdInput, setPokemonIdInput] = useState(String(pokemon.id));

  const computed = calculateAllStats(pokemon.stats, ivs, evs, level, nature);
  const evTotal = Object.values(evs).reduce((sum, v) => sum + v, 0);
  const evOverLimit = evTotal > EV_TOTAL_MAX;

  function handleLevelChange(value: number) {
    setLevel(Math.min(LEVEL_MAX, Math.max(LEVEL_MIN, value)));
  }

  function handleIvChange(stat: keyof PokemonStats, value: number) {
    setIvs((prev) => ({ ...prev, [stat]: Math.min(IV_MAX, Math.max(0, value)) }));
  }

  function handleEvChange(stat: keyof PokemonStats, value: number) {
    setEvs((prev) => ({ ...prev, [stat]: Math.min(EV_MAX, Math.max(0, value)) }));
  }

  function handleNatureChange(name: string) {
    const found = NATURES.find((n) => n.name === name);
    if (found) setNature(found);
  }

  function handleLoadPokemon(e: React.FormEvent) {
    e.preventDefault();
    const id = parseInt(pokemonIdInput, 10);
    if (!isNaN(id) && id >= 1) {
      router.push(`${pathname}?id=${id}`);
    }
  }

  const evTotalDisplay = labels.evTotal
    .replace('{used}', String(evTotal))
    .replace('{max}', String(EV_TOTAL_MAX));

  return (
    <div className="space-y-6">
      {/* Pokémon switcher */}
      <section className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-700 dark:bg-stone-900">
        <form onSubmit={handleLoadPokemon} className="flex items-end gap-3">
          <div className="flex-1">
            <label
              htmlFor="pokemon-id-input"
              className="mb-1 block text-xs font-medium text-stone-600 dark:text-stone-400"
            >
              {labels.pokemonId}
            </label>
            <input
              id="pokemon-id-input"
              type="number"
              min={1}
              value={pokemonIdInput}
              onChange={(e) => setPokemonIdInput(e.target.value)}
              className="h-9 w-full rounded-md border border-stone-200 bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 dark:border-stone-700"
            />
          </div>
          <button
            type="submit"
            className="h-9 rounded-md bg-stone-900 px-4 text-sm font-medium text-white transition-colors hover:bg-stone-700 dark:bg-stone-50 dark:text-stone-900 dark:hover:bg-stone-200"
          >
            {labels.load}
          </button>
        </form>
        <p className="mt-2 text-sm font-semibold text-stone-800 dark:text-stone-100">
          #{String(pokemon.id).padStart(4, '0')} {pokemon.displayName}
        </p>
      </section>

      {/* Level and Nature controls */}
      <section className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-700 dark:bg-stone-900">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="level-number"
              className="mb-1 block text-xs font-medium text-stone-600 dark:text-stone-400"
            >
              {labels.level}
            </label>
            <div className="flex items-center gap-2">
              <input
                id="level-number"
                type="number"
                min={LEVEL_MIN}
                max={LEVEL_MAX}
                value={level}
                onChange={(e) => handleLevelChange(parseInt(e.target.value, 10))}
                className="h-9 w-20 rounded-md border border-stone-200 bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 dark:border-stone-700"
              />
              <input
                type="range"
                min={LEVEL_MIN}
                max={LEVEL_MAX}
                value={level}
                onChange={(e) => handleLevelChange(parseInt(e.target.value, 10))}
                className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-stone-200 accent-stone-900 dark:bg-stone-700 dark:accent-stone-100"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-stone-600 dark:text-stone-400">
              {labels.nature}
            </label>
            <Select value={nature.name} onValueChange={handleNatureChange}>
              <SelectTrigger className="w-full capitalize">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {NATURES.map((n) => (
                  <SelectItem key={n.name} value={n.name} className="capitalize">
                    {n.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Stat table */}
      <section className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm dark:border-stone-700 dark:bg-stone-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-100 bg-stone-50 text-xs font-medium uppercase tracking-wide text-stone-500 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-400">
              <th className="px-4 py-2 text-left">Stat</th>
              <th className="px-3 py-2 text-center">{labels.base}</th>
              <th className="px-3 py-2 text-center">{labels.iv}</th>
              <th className="px-3 py-2 text-center">{labels.ev}</th>
              <th className="px-4 py-2 text-center">{labels.result}</th>
            </tr>
          </thead>
          <tbody>
            {STAT_ROWS.map(({ key, labelKey }, idx) => {
              const isIncreased = key !== 'hp' && nature.increased === key;
              const isDecreased = key !== 'hp' && nature.decreased === key;
              const computedValue = computed[key];

              return (
                <tr
                  key={key}
                  className={
                    idx % 2 === 0
                      ? 'border-b border-stone-100 dark:border-stone-700/60'
                      : 'border-b border-stone-100 bg-stone-50/50 dark:border-stone-700/60 dark:bg-stone-800/30'
                  }
                >
                  <td className="px-4 py-2 font-medium text-stone-700 dark:text-stone-300">
                    {labels[labelKey]}
                  </td>
                  <td className="px-3 py-2 text-center text-stone-600 dark:text-stone-400">
                    {pokemon.stats[key]}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <input
                      type="number"
                      min={0}
                      max={IV_MAX}
                      value={ivs[key]}
                      onChange={(e) => handleIvChange(key, parseInt(e.target.value, 10))}
                      className="h-7 w-14 rounded border border-stone-200 bg-transparent px-1 text-center text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 dark:border-stone-700"
                    />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <input
                      type="number"
                      min={0}
                      max={EV_MAX}
                      value={evs[key]}
                      onChange={(e) => handleEvChange(key, parseInt(e.target.value, 10))}
                      aria-invalid={evOverLimit || undefined}
                      className="h-7 w-14 rounded border border-stone-200 bg-transparent px-1 text-center text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 aria-invalid:border-destructive dark:border-stone-700"
                    />
                  </td>
                  <td
                    className={[
                      'px-4 py-2 text-center font-bold',
                      isIncreased
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : isDecreased
                          ? 'text-red-500 dark:text-red-400'
                          : 'text-stone-800 dark:text-stone-200',
                    ].join(' ')}
                  >
                    {computedValue}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* EV total */}
        <div className="border-t border-stone-100 px-4 py-3 dark:border-stone-700">
          <p
            className={[
              'text-xs font-medium',
              evOverLimit
                ? 'text-red-500 dark:text-red-400'
                : 'text-stone-500 dark:text-stone-400',
            ].join(' ')}
          >
            {evTotalDisplay}
          </p>
          {evOverLimit && (
            <p className="mt-0.5 text-xs text-red-500 dark:text-red-400">{labels.evWarning}</p>
          )}
        </div>
      </section>
    </div>
  );
}
