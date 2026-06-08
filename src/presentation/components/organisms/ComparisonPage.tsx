'use client';

import { useSearchParams } from 'next/navigation';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { ComparisonPicker } from '@/presentation/components/molecules/ComparisonPicker';
import { ComparisonRadarChart } from '@/presentation/components/molecules/ComparisonRadarChart';
import { usePokemonById } from '@/presentation/queries/pokemonQueries';
import type { RadarEntry } from '@/presentation/components/molecules/ComparisonRadarChart';

type SlotKey = 'a' | 'b' | 'c';

const SLOTS: SlotKey[] = ['a', 'b', 'c'];

const SLOT_COLORS: Record<SlotKey, { hex: string; border: string; bar: string }> = {
  a: { hex: '#f97316', border: '#f97316', bar: 'bg-orange-500' },
  b: { hex: '#3b82f6', border: '#3b82f6', bar: 'bg-blue-500' },
  c: { hex: '#22c55e', border: '#22c55e', bar: 'bg-green-500' },
};

const STAT_ROWS = [
  { key: 'hp' as const, label: 'HP' },
  { key: 'attack' as const, label: 'ATK' },
  { key: 'defense' as const, label: 'DEF' },
  { key: 'specialAttack' as const, label: 'SpA' },
  { key: 'specialDefense' as const, label: 'SpD' },
  { key: 'speed' as const, label: 'SPD' },
] as const;

const MAX_STAT = 255;
const MAX_BST = 720;

export function ComparisonPage() {
  const t = useTranslations('compare');
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const ids: Record<SlotKey, number | null> = {
    a: parseId(searchParams.get('a')),
    b: parseId(searchParams.get('b')),
    c: parseId(searchParams.get('c')),
  };

  const queryA = usePokemonById(ids.a);
  const queryB = usePokemonById(ids.b);
  const queryC = usePokemonById(ids.c);
  const queries = { a: queryA, b: queryB, c: queryC };

  function setSlot(slot: SlotKey, id: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(slot, String(id));
    router.replace(`${pathname}?${params.toString()}`);
  }

  function clearSlot(slot: SlotKey) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(slot);
    router.replace(`${pathname}?${params.toString()}`);
  }

  const filledEntries = SLOTS.flatMap((slot) => {
    const p = queries[slot].data;
    if (!p) return [];
    return [{ slot, pokemon: p, color: SLOT_COLORS[slot] }];
  });

  const radarEntries: RadarEntry[] = filledEntries.map(({ pokemon, color }) => ({
    stats: pokemon.stats,
    color: color.hex,
    name: pokemon.displayName,
  }));

  const canCompare = filledEntries.length >= 2;

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-black tracking-tight text-stone-900">
          {t('heading')}
        </h1>
        <p className="mt-1 text-sm text-stone-400">{t('subtitle')}</p>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {SLOTS.map((slot, i) => (
          <ComparisonPicker
            key={slot}
            label={t('slot', { slot: String.fromCharCode(65 + i) })}
            borderColor={SLOT_COLORS[slot].border}
            pokemon={queries[slot].data ?? null}
            isLoading={queries[slot].isLoading}
            onSelect={(id) => setSlot(slot, id)}
            onClear={() => clearSlot(slot)}
          />
        ))}
      </div>

      {!canCompare ? (
        <div className="mt-16 flex flex-col items-center justify-center py-8 text-center">
          <span className="mb-3 text-4xl">⚖️</span>
          <p className="text-sm text-stone-400">{t('selectTwo')}</p>
        </div>
      ) : (
        <div className="mt-10 space-y-10">
          <section>
            <h2 className="mb-5 font-display text-lg font-black tracking-tight text-stone-800">
              {t('radarSection')}
            </h2>
            <ComparisonRadarChart entries={radarEntries} />
          </section>

          <section>
            <h2 className="mb-5 font-display text-lg font-black tracking-tight text-stone-800">
              {t('statsSection')}
            </h2>
            <div className="space-y-3">
              {STAT_ROWS.map(({ key, label }) => {
                const values = filledEntries.map((e) => e.pokemon.stats[key]);
                const maxVal = Math.max(...values);
                return (
                  <div key={key} className="grid grid-cols-[3rem_1fr] items-start gap-x-3">
                    <span className="pt-1 text-right font-mono text-xs font-semibold text-stone-400">
                      {label}
                    </span>
                    <div className="space-y-1.5">
                      {filledEntries.map(({ slot, pokemon, color }) => {
                        const val = pokemon.stats[key];
                        return (
                          <div key={slot} className="flex items-center gap-2">
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-stone-100">
                              <div
                                className={`h-full rounded-full transition-[width] duration-700 ${color.bar}`}
                                style={
                                  {
                                    '--bar-w': `${(val / MAX_STAT) * 100}%`,
                                  } as React.CSSProperties
                                }
                                role="presentation"
                              />
                            </div>
                            <span
                              className={`w-7 text-right font-mono text-xs font-bold ${val === maxVal ? 'text-stone-900' : 'text-stone-400'}`}
                            >
                              {val}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              <div className="grid grid-cols-[3rem_1fr] items-start gap-x-3 border-t border-stone-100 pt-3">
                <span className="pt-1 text-right font-mono text-xs font-semibold text-stone-500">
                  {t('bst')}
                </span>
                <div className="space-y-1.5">
                  {filledEntries.map(({ slot, pokemon, color }) => {
                    const bst = Object.values(pokemon.stats).reduce((s, v) => s + v, 0);
                    const maxBst = Math.max(
                      ...filledEntries.map(({ pokemon: p }) =>
                        Object.values(p.stats).reduce((s, v) => s + v, 0),
                      ),
                    );
                    return (
                      <div key={slot} className="flex items-center gap-2">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-stone-100">
                          <div
                            className={`h-full rounded-full transition-[width] duration-700 ${color.bar}`}
                            style={
                              { '--bar-w': `${(bst / MAX_BST) * 100}%` } as React.CSSProperties
                            }
                            role="presentation"
                          />
                        </div>
                        <span
                          className={`w-8 text-right font-mono text-xs font-bold ${bst === maxBst ? 'text-stone-900' : 'text-stone-400'}`}
                        >
                          {bst}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function parseId(s: string | null): number | null {
  if (!s) return null;
  const n = parseInt(s, 10);
  return isNaN(n) || n < 1 ? null : n;
}
