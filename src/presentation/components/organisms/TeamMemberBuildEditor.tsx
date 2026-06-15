'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/select';
import { MovePicker } from '@/presentation/components/molecules/MovePicker';
import { NATURES, getNature } from '@/domain/data/natures';
import {
  calculateAllStats,
  IV_MAX,
  EV_MAX,
  EV_TOTAL_MAX,
  LEVEL_MIN,
  LEVEL_MAX,
} from '@/domain/usecases/calculateStats';
import { validateTeamMemberBuild } from '@/domain/usecases/validateTeamMemberBuild';
import type { TeamMemberBuild } from '@/domain/entities/TeamMemberBuild';
import type { PokemonStats, PokemonAbilityRef } from '@/domain/entities/Pokemon';
import type { LearnedMove } from '@/domain/entities/Move';

const STAT_ROWS: Array<{ key: keyof PokemonStats; tKey: string }> = [
  { key: 'hp', tKey: 'statHp' },
  { key: 'attack', tKey: 'statAttack' },
  { key: 'defense', tKey: 'statDefense' },
  { key: 'specialAttack', tKey: 'statSpecialAttack' },
  { key: 'specialDefense', tKey: 'statSpecialDefense' },
  { key: 'speed', tKey: 'statSpeed' },
];

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

interface TeamMemberBuildEditorProps {
  pokemonId: number;
  displayName: string;
  baseStats: PokemonStats;
  abilities: readonly PokemonAbilityRef[];
  learnedMoves: readonly LearnedMove[];
  initialBuild?: TeamMemberBuild;
  onSave: (build: TeamMemberBuild) => void;
  onClose: () => void;
}

export function TeamMemberBuildEditor({
  baseStats,
  abilities,
  learnedMoves,
  initialBuild,
  onSave,
  onClose,
}: TeamMemberBuildEditorProps) {
  const t = useTranslations('teamBuild');
  const tStat = useTranslations('statCalculator');

  const [abilityName, setAbilityName] = useState(
    initialBuild?.abilityName ?? abilities[0]?.name ?? '',
  );
  const [natureName, setNatureName] = useState(initialBuild?.natureName ?? 'hardy');
  const [level, setLevel] = useState(initialBuild?.level ?? 50);
  const [ivs, setIvs] = useState<PokemonStats>(initialBuild?.ivs ?? DEFAULT_IVS);
  const [evs, setEvs] = useState<PokemonStats>(initialBuild?.evs ?? DEFAULT_EVS);
  const [moveNames, setMoveNames] = useState<readonly string[]>(initialBuild?.moveNames ?? []);
  const [validationError, setValidationError] = useState('');

  const nature = getNature(natureName) ?? NATURES[0]!;
  const computed = calculateAllStats(baseStats, ivs, evs, level, nature);
  const evTotal = Object.values(evs).reduce((s, v) => s + v, 0);
  const evRemaining = EV_TOTAL_MAX - evTotal;
  const evOverLimit = evTotal > EV_TOTAL_MAX;

  const legalAbilityNames = useMemo(() => abilities.map((a) => a.name), [abilities]);
  const legalMoveNames = useMemo(() => learnedMoves.map((lm) => lm.move.name), [learnedMoves]);

  function handleLevelChange(value: number) {
    setLevel(Math.min(LEVEL_MAX, Math.max(LEVEL_MIN, isNaN(value) ? LEVEL_MIN : value)));
  }

  function handleIvChange(stat: keyof PokemonStats, value: number) {
    setIvs((prev) => ({
      ...prev,
      [stat]: Math.min(IV_MAX, Math.max(0, isNaN(value) ? 0 : value)),
    }));
  }

  function handleEvChange(stat: keyof PokemonStats, raw: number) {
    const value = Math.min(EV_MAX, Math.max(0, isNaN(raw) ? 0 : raw));
    const otherTotal = evTotal - evs[stat];
    const clamped = Math.min(value, EV_TOTAL_MAX - otherTotal);
    setEvs((prev) => ({ ...prev, [stat]: clamped }));
  }

  function handleSave() {
    const build: TeamMemberBuild = { abilityName, natureName, level, ivs, evs, moveNames };
    const result = validateTeamMemberBuild(build, legalAbilityNames, legalMoveNames);
    if (!result.ok) {
      setValidationError(t('validationError'));
      return;
    }
    setValidationError('');
    onSave(build);
  }

  function handleReset() {
    setAbilityName(abilities[0]?.name ?? '');
    setNatureName('hardy');
    setLevel(50);
    setIvs(DEFAULT_IVS);
    setEvs(DEFAULT_EVS);
    setMoveNames([]);
    setValidationError('');
  }

  function natureLabel(name: string): string {
    const n = getNature(name);
    if (!n) return name;
    if (!n.increased) return t('natureNeutral', { nature: name });
    const fmt = (s: string) =>
      s === 'specialAttack'
        ? 'Sp. Atk'
        : s === 'specialDefense'
          ? 'Sp. Def'
          : s.charAt(0).toUpperCase() + s.slice(1);
    return t('natureHint', { nature: name, up: fmt(n.increased), down: fmt(n.decreased ?? '') });
  }

  return (
    <div className="space-y-5">
      {/* Ability */}
      <section>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
          {t('ability')}
        </label>
        <Select value={abilityName} onValueChange={setAbilityName}>
          <SelectTrigger className="w-full capitalize">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {abilities.map((a) => (
              <SelectItem key={a.name} value={a.name} className="capitalize">
                {a.name.replace(/-/g, ' ')}
                {a.isHidden && (
                  <span className="ml-1.5 text-xs text-stone-400">({t('hiddenAbility')})</span>
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>

      {/* Nature + Level */}
      <section className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
            {t('nature')}
          </label>
          <Select value={natureName} onValueChange={setNatureName}>
            <SelectTrigger className="w-full capitalize">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {NATURES.map((n) => (
                <SelectItem key={n.name} value={n.name} className="capitalize">
                  {natureLabel(n.name)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label
            htmlFor="build-level"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400"
          >
            {t('level')}
          </label>
          <div className="flex items-center gap-2">
            <input
              id="build-level"
              type="number"
              min={LEVEL_MIN}
              max={LEVEL_MAX}
              value={level}
              onChange={(e) => handleLevelChange(parseInt(e.target.value, 10))}
              className="h-9 w-16 rounded-md border border-stone-200 bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 dark:border-stone-700"
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
      </section>

      {/* IV / EV stat table */}
      <section>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
            {t('ivs')} / {t('evs')}
          </span>
          <span
            className={[
              'text-xs font-medium',
              evOverLimit ? 'text-red-500' : 'text-stone-500 dark:text-stone-400',
            ].join(' ')}
          >
            {t('evBudget', { remaining: Math.max(0, evRemaining) })}
          </span>
        </div>
        <div className="overflow-hidden rounded-lg border border-stone-200 dark:border-stone-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50 text-xs font-medium uppercase tracking-wide text-stone-500 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-400">
                <th className="px-3 py-1.5 text-left">Stat</th>
                <th className="px-2 py-1.5 text-center">{tStat('base')}</th>
                <th className="px-2 py-1.5 text-center">{tStat('iv')}</th>
                <th className="px-2 py-1.5 text-center">{tStat('ev')}</th>
                <th className="px-3 py-1.5 text-center">{tStat('result')}</th>
              </tr>
            </thead>
            <tbody>
              {STAT_ROWS.map(({ key, tKey }, idx) => {
                const isIncreased = key !== 'hp' && nature.increased === key;
                const isDecreased = key !== 'hp' && nature.decreased === key;
                return (
                  <tr
                    key={key}
                    className={
                      idx % 2 === 0
                        ? 'border-b border-stone-100 dark:border-stone-700/60'
                        : 'border-b border-stone-100 bg-stone-50/50 dark:border-stone-700/60 dark:bg-stone-800/30'
                    }
                  >
                    <td className="px-3 py-1.5 font-medium text-stone-700 dark:text-stone-300">
                      {tStat(tKey as Parameters<typeof tStat>[0])}
                    </td>
                    <td className="px-2 py-1.5 text-center text-stone-500 dark:text-stone-400">
                      {baseStats[key]}
                    </td>
                    <td className="px-2 py-1.5 text-center">
                      <input
                        type="number"
                        min={0}
                        max={IV_MAX}
                        value={ivs[key]}
                        onChange={(e) => handleIvChange(key, parseInt(e.target.value, 10))}
                        className="h-7 w-12 rounded border border-stone-200 bg-transparent px-1 text-center text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 dark:border-stone-700"
                      />
                    </td>
                    <td className="px-2 py-1.5 text-center">
                      <input
                        type="number"
                        min={0}
                        max={EV_MAX}
                        value={evs[key]}
                        onChange={(e) => handleEvChange(key, parseInt(e.target.value, 10))}
                        aria-invalid={evOverLimit || undefined}
                        className="h-7 w-12 rounded border border-stone-200 bg-transparent px-1 text-center text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 aria-invalid:border-destructive dark:border-stone-700"
                      />
                    </td>
                    <td
                      className={[
                        'px-3 py-1.5 text-center font-bold',
                        isIncreased
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : isDecreased
                            ? 'text-red-500 dark:text-red-400'
                            : 'text-stone-800 dark:text-stone-200',
                      ].join(' ')}
                    >
                      {computed[key]}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Move picker */}
      <section>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
          {t('moves')}
        </label>
        <MovePicker
          learnedMoves={learnedMoves}
          selected={moveNames}
          onChange={setMoveNames}
          searchPlaceholder={t('searchMoves')}
          noMovesLabel={t('noMoves')}
          selectUpToFourLabel={t('selectUpToFour')}
        />
      </section>

      {validationError && (
        <p className="text-xs text-red-500 dark:text-red-400">{validationError}</p>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-stone-100 pt-4 dark:border-stone-800">
        <button
          type="button"
          onClick={handleReset}
          className="text-xs font-medium text-stone-400 transition-colors hover:text-stone-600 dark:hover:text-stone-300"
        >
          {t('reset')}
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-stone-200 px-3 py-1.5 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-50 dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-md bg-stone-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-stone-700 dark:bg-stone-50 dark:text-stone-900 dark:hover:bg-stone-200"
          >
            {t('save')}
          </button>
        </div>
      </div>
    </div>
  );
}
