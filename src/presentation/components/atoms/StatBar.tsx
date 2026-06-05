'use client';

import { useEffect, useRef, useState } from 'react';

const STAT_COLORS: Record<string, string> = {
  hp: '#22c55e',
  attack: '#ef4444',
  defense: '#3b82f6',
  specialAttack: '#a855f7',
  specialDefense: '#06b6d4',
  speed: '#eab308',
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
  const color = STAT_COLORS[statKey] ?? '#9ca3af';
  const label = STAT_LABELS[statKey] ?? statKey;

  return (
    <div ref={ref} className="flex items-center gap-3">
      <span className="w-9 shrink-0 font-mono text-xs font-medium text-stone-400 uppercase tracking-wider">
        {label}
      </span>
      <span className="w-8 shrink-0 text-right font-mono text-sm font-semibold text-stone-700">
        {value}
      </span>
      <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-stone-100">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-700 ease-out"
          style={{
            width: animated ? `${pct}%` : '0%',
            backgroundColor: color,
            transitionDelay: '0.1s',
          }}
        />
      </div>
    </div>
  );
}
