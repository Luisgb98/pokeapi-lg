'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { TypeBadge } from '@/presentation/components/atoms/TypeBadge';
import type { LearnedMove, LearnMethod } from '@/domain/entities/Move';
import { LEARN_METHODS } from '@/domain/entities/Move';

type FilterTab = 'all' | LearnMethod;
type SortKey = 'level' | 'name' | 'type' | 'power' | 'accuracy' | 'pp';
type SortDir = 'asc' | 'desc';

interface Props {
  learnset: readonly LearnedMove[];
}

const DAMAGE_CLASS_COLORS = {
  physical: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
  special: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  status: 'bg-stone-100 text-stone-500 dark:bg-stone-700 dark:text-stone-400',
} as const;

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <span
      className={`ml-0.5 text-[10px] ${active ? 'text-stone-900 dark:text-stone-100' : 'text-stone-300 dark:text-stone-500'}`}
    >
      {!active || dir === 'asc' ? '↑' : '↓'}
    </span>
  );
}

export function MoveLearnsetTable({ learnset }: Props) {
  const t = useTranslations('moves');
  const tTypes = useTranslations('types');

  const availableMethods = new Set(learnset.map((m) => m.learnMethod));
  const defaultTab: FilterTab = availableMethods.has('level-up') ? 'level-up' : 'all';

  const [activeTab, setActiveTab] = useState<FilterTab>(defaultTab);
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: 'level', dir: 'asc' });
  const [search, setSearch] = useState('');

  const query = search.trim().toLowerCase();
  const searchFiltered = query
    ? learnset.filter((m) => m.move.displayName.toLowerCase().includes(query))
    : learnset;

  const filtered =
    activeTab === 'all'
      ? searchFiltered
      : searchFiltered.filter((m) => m.learnMethod === activeTab);

  const sorted = filtered.toSorted((a, b) => {
    let cmp = 0;
    switch (sort.key) {
      case 'level':
        cmp = a.levelLearnedAt - b.levelLearnedAt;
        break;
      case 'name':
        cmp = a.move.displayName.localeCompare(b.move.displayName);
        break;
      case 'type':
        cmp = a.move.type.localeCompare(b.move.type);
        break;
      case 'power':
        cmp = (a.move.power ?? -1) - (b.move.power ?? -1);
        break;
      case 'accuracy':
        cmp = (a.move.accuracy ?? -1) - (b.move.accuracy ?? -1);
        break;
      case 'pp':
        cmp = a.move.pp - b.move.pp;
        break;
    }
    return sort.dir === 'asc' ? cmp : -cmp;
  });

  function toggleSort(key: SortKey) {
    setSort((prev) =>
      prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' },
    );
  }

  function handleTabChange(tab: FilterTab) {
    setActiveTab(tab);
    setSort({ key: tab === 'level-up' ? 'level' : 'name', dir: 'asc' });
  }

  const tabs: Array<{ key: FilterTab; label: string }> = [
    { key: 'all', label: t('all') },
    ...LEARN_METHODS.flatMap((m) =>
      availableMethods.has(m) ? [{ key: m as FilterTab, label: methodLabel(m, t) }] : [],
    ),
  ];

  const showLevel = activeTab === 'level-up' || activeTab === 'all';
  const showMethod = activeTab === 'all';

  return (
    <section className="rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-stone-700 dark:bg-stone-900">
      <div className="border-b border-stone-100 px-6 pb-0 pt-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.15em] text-stone-400 dark:text-stone-500">
            {t('section')}
          </h2>
          <div className="relative">
            <svg
              className="pointer-events-none absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-stone-400"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                clipRule="evenodd"
              />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="h-7 rounded-lg border border-stone-200 bg-stone-50 pl-7 pr-3 text-xs text-stone-700 placeholder-stone-400 outline-none focus:border-stone-400 focus:bg-white dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:placeholder:text-stone-500"
            />
          </div>
        </div>
        <div className="flex gap-1 overflow-x-auto pb-px">
          {tabs.map(({ key, label }) => {
            const count =
              key === 'all'
                ? searchFiltered.length
                : searchFiltered.filter((m) => m.learnMethod === key).length;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleTabChange(key)}
                className={[
                  'shrink-0 rounded-t-lg px-3 py-2 text-xs font-semibold transition-colors',
                  activeTab === key
                    ? 'border-b-2 border-stone-900 text-stone-900 dark:border-stone-300 dark:text-stone-100'
                    : 'text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300',
                ].join(' ')}
              >
                {label}
                <span className="ml-1.5 text-[10px] text-stone-400">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="overflow-x-auto">
        {sorted.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-stone-400">
            {query ? t('noMovesSearch', { query: search.trim() }) : t('noMoves')}
          </p>
        ) : (
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50 dark:border-stone-800 dark:bg-stone-800">
                {showLevel && (
                  <th className="w-12 px-4 py-3 text-left">
                    <button
                      type="button"
                      onClick={() => toggleSort('level')}
                      className="font-mono text-xs font-semibold text-stone-400 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
                    >
                      {t('level')}
                      <SortIcon active={sort.key === 'level'} dir={sort.dir} />
                    </button>
                  </th>
                )}
                {showMethod && (
                  <th className="w-24 px-4 py-3 text-left text-xs font-semibold text-stone-400">
                    {t('method')}
                  </th>
                )}
                <th className="px-4 py-3 text-left">
                  <button
                    type="button"
                    onClick={() => toggleSort('name')}
                    className="text-xs font-semibold text-stone-400 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
                  >
                    {t('move')}
                    <SortIcon active={sort.key === 'name'} dir={sort.dir} />
                  </button>
                </th>
                <th className="w-20 px-4 py-3 text-left">
                  <button
                    type="button"
                    onClick={() => toggleSort('type')}
                    className="text-xs font-semibold text-stone-400 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
                  >
                    {t('type')}
                    <SortIcon active={sort.key === 'type'} dir={sort.dir} />
                  </button>
                </th>
                <th className="w-20 px-4 py-3 text-left text-xs font-semibold text-stone-400">
                  {t('category')}
                </th>
                <th className="w-16 px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => toggleSort('power')}
                    className="text-xs font-semibold text-stone-400 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
                  >
                    {t('power')}
                    <SortIcon active={sort.key === 'power'} dir={sort.dir} />
                  </button>
                </th>
                <th className="w-16 px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => toggleSort('accuracy')}
                    className="text-xs font-semibold text-stone-400 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
                  >
                    {t('accuracy')}
                    <SortIcon active={sort.key === 'accuracy'} dir={sort.dir} />
                  </button>
                </th>
                <th className="w-12 px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => toggleSort('pp')}
                    className="text-xs font-semibold text-stone-400 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
                  >
                    {t('pp')}
                    <SortIcon active={sort.key === 'pp'} dir={sort.dir} />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50 dark:divide-stone-800">
              {sorted.map((entry, i) => (
                <tr
                  key={`${entry.move.id}-${entry.learnMethod}-${i}`}
                  className="hover:bg-stone-50 dark:hover:bg-stone-800"
                >
                  {showLevel && (
                    <td className="px-4 py-2.5 text-center font-mono text-xs text-stone-400 dark:text-stone-500">
                      {entry.learnMethod === 'level-up' && entry.levelLearnedAt > 0
                        ? entry.levelLearnedAt
                        : '—'}
                    </td>
                  )}
                  {showMethod && (
                    <td className="px-4 py-2.5">
                      <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-500 dark:bg-stone-700 dark:text-stone-300">
                        {methodLabel(entry.learnMethod, t)}
                      </span>
                    </td>
                  )}
                  <td className="px-4 py-2.5 font-display text-xs font-bold text-stone-800 dark:text-stone-100">
                    {entry.move.displayName}
                  </td>
                  <td className="px-4 py-2.5">
                    <TypeBadge type={entry.move.type} size="sm" label={tTypes(entry.move.type)} />
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${DAMAGE_CLASS_COLORS[entry.move.damageClass]}`}
                    >
                      {t(entry.move.damageClass)}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-xs text-stone-700 dark:text-stone-300">
                    {entry.move.power ?? '—'}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-xs text-stone-700 dark:text-stone-300">
                    {entry.move.accuracy != null ? `${entry.move.accuracy}%` : '—'}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-xs text-stone-700 dark:text-stone-300">
                    {entry.move.pp}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

function methodLabel(method: LearnMethod, t: (key: string) => string): string {
  const map: Record<LearnMethod, string> = {
    'level-up': t('levelUp'),
    machine: t('machine'),
    egg: t('egg'),
    tutor: t('tutor'),
  };
  return map[method];
}
