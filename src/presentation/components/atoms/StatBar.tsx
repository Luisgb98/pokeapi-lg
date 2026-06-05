'use client';

import { useEffect, useRef, useState } from 'react';

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
  const [animated, setAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setAnimated(true);
      },
      { threshold: 0.3 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const pct = Math.round((value / max) * 100);
  const label = STAT_LABELS[statKey] ?? statKey;

  return (
    <div ref={ref} className="flex items-center gap-3">
      <span className="w-9 shrink-0 font-mono text-xs font-medium uppercase tracking-wider text-stone-400">
        {label}
      </span>
      <span className="w-8 shrink-0 text-right font-mono text-sm font-semibold text-stone-700">
        {value}
      </span>
      <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-stone-100">
        <div
          className={`absolute inset-y-0 left-0 w-[var(--bar-w)] rounded-full transition-[width] duration-700 ease-out delay-100 ${STAT_BG[statKey] ?? 'bg-gray-400'}`}
          style={{ '--bar-w': animated ? `${pct}%` : '0%' } as React.CSSProperties}
        />
      </div>
    </div>
  );
}
