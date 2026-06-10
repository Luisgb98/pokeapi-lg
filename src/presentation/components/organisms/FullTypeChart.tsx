import { POKEMON_TYPES } from '@/domain/entities/Pokemon';
import { getTypeChart } from '@/domain/entities/typeChart';
import { TYPE_CLASSES } from '@/presentation/lib/typeColors';
import type { PokemonType } from '@/domain/entities/Pokemon';

interface FullTypeChartProps {
  typeLabels: Record<PokemonType, string>;
  title: string;
  subtitle: string;
  attackLabel: string;
  defenseLabel: string;
}

function cellStyle(multiplier: number): string {
  if (multiplier === 0) return 'bg-stone-200 text-stone-500 dark:bg-stone-700 dark:text-stone-300';
  if (multiplier === 0.25)
    return 'bg-indigo-200 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300';
  if (multiplier === 0.5) return 'bg-sky-200 text-sky-800 dark:bg-sky-950 dark:text-sky-300';
  if (multiplier === 2)
    return 'bg-orange-300 text-orange-900 dark:bg-orange-950 dark:text-orange-300';
  if (multiplier === 4) return 'bg-red-400 text-white dark:bg-red-900 dark:text-red-200';
  return 'bg-stone-50 text-stone-300 dark:bg-stone-800 dark:text-stone-600';
}

function cellText(multiplier: number): string {
  if (multiplier === 0) return '×0';
  if (multiplier === 0.25) return '0.25';
  if (multiplier === 0.5) return '0.5';
  if (multiplier === 2) return '×2';
  if (multiplier === 4) return '×4';
  return '';
}

const CHART = getTypeChart();

export function FullTypeChart({
  typeLabels,
  title,
  subtitle,
  attackLabel,
  defenseLabel,
}: FullTypeChartProps) {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6 dark:border-stone-700 dark:bg-stone-900">
      <div className="mb-4">
        <h2 className="font-display text-sm font-bold uppercase tracking-[0.15em] text-stone-400 dark:text-stone-500">
          {title}
        </h2>
        <p className="mt-0.5 text-xs text-stone-400 dark:text-stone-500">{subtitle}</p>
      </div>

      <div className="overflow-x-auto">
        <p className="mb-1 text-right text-xs text-stone-300 sm:hidden">scroll →</p>
        <table className="border-collapse text-xs" aria-label={title}>
          <thead>
            <tr>
              <th
                scope="col"
                className="sticky left-0 z-10 min-w-[80px] bg-white pb-2 pr-2 text-right align-bottom dark:bg-stone-900"
              >
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                  {attackLabel} ↓ / {defenseLabel} →
                </span>
              </th>
              {POKEMON_TYPES.map((defType) => (
                <th
                  key={defType}
                  scope="col"
                  className="px-0.5 pb-2 align-bottom"
                  title={typeLabels[defType]}
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <span
                      className={`inline-block size-3.5 rounded-full ${TYPE_CLASSES[defType].accentBg}`}
                      aria-hidden="true"
                    />
                    <span className="block whitespace-nowrap font-medium text-stone-500 [writing-mode:vertical-rl] [transform:rotate(180deg)] dark:text-stone-400">
                      {typeLabels[defType]}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {POKEMON_TYPES.map((atkType) => (
              <tr key={atkType} className="hover:bg-stone-50 dark:hover:bg-stone-800">
                <th
                  scope="row"
                  className="sticky left-0 z-10 bg-white pr-2 text-right font-medium text-stone-600 dark:bg-stone-900 dark:text-stone-400"
                >
                  <div className="flex items-center justify-end gap-1.5 py-0.5">
                    <span className="whitespace-nowrap">{typeLabels[atkType]}</span>
                    <span
                      className={`inline-block size-3 shrink-0 rounded-full ${TYPE_CLASSES[atkType].accentBg}`}
                      aria-hidden="true"
                    />
                  </div>
                </th>
                {POKEMON_TYPES.map((defType) => {
                  const mult = CHART[atkType][defType];
                  return (
                    <td
                      key={defType}
                      className={`size-8 min-w-[2rem] rounded-sm text-center font-bold leading-none ${cellStyle(mult)}`}
                      title={`${typeLabels[atkType]} → ${typeLabels[defType]}: ×${mult}`}
                    >
                      {cellText(mult)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
