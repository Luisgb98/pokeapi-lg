'use client';

import { useEffect, useState } from 'react';
import type { PokemonStats } from '@/domain/entities/Pokemon';

export interface RadarEntry {
  stats: PokemonStats;
  color: string;
  name: string;
}

const STAT_CONFIG = [
  { key: 'hp' as const, label: 'HP', angle: -90 },
  { key: 'attack' as const, label: 'ATK', angle: -30 },
  { key: 'defense' as const, label: 'DEF', angle: 30 },
  { key: 'specialAttack' as const, label: 'SpA', angle: 90 },
  { key: 'specialDefense' as const, label: 'SpD', angle: 150 },
  { key: 'speed' as const, label: 'SPD', angle: 210 },
] as const;

const CX = 150;
const CY = 150;
const RADAR_R = 85;
const LABEL_R = 115;
const MAX_STAT = 255;
const DEG = Math.PI / 180;
const DELAY_CLASSES = ['delay-0', 'delay-100', 'delay-200'] as const;

function polarToXY(angleDeg: number, radius: number) {
  return {
    x: CX + radius * Math.cos(angleDeg * DEG),
    y: CY + radius * Math.sin(angleDeg * DEG),
  };
}

function buildPoints(stats: PokemonStats): string {
  return STAT_CONFIG.map(({ key, angle }) => {
    const { x, y } = polarToXY(angle, (stats[key] / MAX_STAT) * RADAR_R);
    return `${x},${y}`;
  }).join(' ');
}

const GRID_RINGS = [0.25, 0.5, 0.75, 1.0].map((f) =>
  STAT_CONFIG.map(({ angle }) => {
    const { x, y } = polarToXY(angle, f * RADAR_R);
    return `${x},${y}`;
  }).join(' '),
);

export function ComparisonRadarChart({ entries }: { entries: RadarEntry[] }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(id);
  }, []);

  return (
    <div>
      <svg
        viewBox="0 0 300 300"
        aria-hidden="true"
        className="mx-auto w-full max-w-[280px] select-none"
      >
        {GRID_RINGS.map((pts, i) => (
          <polygon key={i} points={pts} fill="none" stroke="#e7e5e4" strokeWidth="1" />
        ))}

        {STAT_CONFIG.map(({ angle }) => {
          const { x, y } = polarToXY(angle, RADAR_R);
          return (
            <line key={angle} x1={CX} y1={CY} x2={x} y2={y} stroke="#e7e5e4" strokeWidth="1" />
          );
        })}

        {entries.map((entry, i) => (
          <g
            key={i}
            className={[
              'origin-[150px_150px]',
              'transition-[transform,opacity] duration-700',
              'ease-[cubic-bezier(0.34,1.56,0.64,1)]',
              DELAY_CLASSES[i] ?? 'delay-0',
              visible ? 'scale-100 opacity-100' : 'scale-0 opacity-0',
            ].join(' ')}
          >
            <polygon
              points={buildPoints(entry.stats)}
              fill={entry.color}
              fillOpacity={0.15}
              stroke={entry.color}
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </g>
        ))}

        {STAT_CONFIG.map(({ key, label, angle }) => {
          const { x, y } = polarToXY(angle, LABEL_R);
          const cosA = Math.cos(angle * DEG);
          const anchor = cosA > 0.3 ? 'start' : cosA < -0.3 ? 'end' : 'middle';
          return (
            <text
              key={key}
              x={x}
              y={y}
              textAnchor={anchor}
              dominantBaseline="middle"
              fontSize="9"
              fontWeight="600"
              letterSpacing="0.8"
              fill="#a8a29e"
            >
              {label}
            </text>
          );
        })}
      </svg>

      <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1">
        {entries.map((entry) => (
          <div key={entry.name} className="flex items-center gap-1.5">
            <span
              className="inline-block size-2.5 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs font-medium text-stone-600">{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
