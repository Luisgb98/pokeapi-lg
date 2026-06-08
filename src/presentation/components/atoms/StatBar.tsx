'use client';

import { useEffect, useRef } from 'react';

const STAT_BG: Record<string, string> = {
  hp: 'bg-green-500',
  attack: 'bg-red-500',
  defense: 'bg-blue-500',
  specialAttack: 'bg-purple-500',
  specialDefense: 'bg-cyan-500',
  speed: 'bg-yellow-500',
};

const STAT_LABELS: Record<string, string> = {
  hp: 'HP',
  attack: 'ATK',
  defense: 'DEF',
  specialAttack: 'SpA',
  specialDefense: 'SpD',
  speed: 'SPD',
};

interface StatBarProps {
  statKey: string;
  value: number;
  max?: number;
}

export function StatBar({ statKey, value, max = 255 }: StatBarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const pct = Math.round((value / max) * 100);
  const label = STAT_LABELS[statKey] ?? statKey;

  useEffect(() => {
    const bar = barRef.current;
    const container = containerRef.current;
    if (!bar || !container) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          bar.style.setProperty('--bar-w', `${pct}%`);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, [pct]);

  return (
    <div ref={containerRef} className="flex items-center gap-3">
      <span className="w-9 shrink-0 font-mono text-xs font-medium uppercase tracking-wider text-stone-400">
        {label}
      </span>
      <span className="w-8 shrink-0 text-right font-mono text-sm font-semibold text-stone-700">
        {value}
      </span>
      <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-stone-100">
        <div
          ref={barRef}
          className={`absolute inset-y-0 left-0 w-[var(--bar-w,0%)] rounded-full transition-[width] duration-700 ease-out delay-100 ${STAT_BG[statKey] ?? 'bg-gray-400'}`}
        />
      </div>
    </div>
  );
}
