'use client';

import { useEffect, useState } from 'react';
import type { PokemonStats } from '@/domain/entities/Pokemon';

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

function polarToXY(angleDeg: number, radius: number) {
  return {
    x: CX + radius * Math.cos(angleDeg * DEG),
    y: CY + radius * Math.sin(angleDeg * DEG),
  };
}

function buildPoints(fractions: number[]): string {
  return STAT_CONFIG.map(({ angle }, i) => {
    const { x, y } = polarToXY(angle, fractions[i] * RADAR_R);
    return `${x},${y}`;
  }).join(' ');
}

const GRID_RINGS = [0.25, 0.5, 0.75, 1.0].map((f) =>
  STAT_CONFIG.map(({ angle }) => {
    const { x, y } = polarToXY(angle, f * RADAR_R);
    return `${x},${y}`;
  }).join(' '),
);

export function StatsRadarChart({ stats }: { stats: PokemonStats }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(id);
  }, []);

  const fractions = STAT_CONFIG.map(({ key }) => stats[key] / MAX_STAT);
  const polygon = buildPoints(fractions);

  return (
    <svg
      viewBox="0 0 300 300"
      aria-hidden="true"
      className="mx-auto w-full max-w-[220px] select-none"
    >
      {/* Background grid rings */}
      {GRID_RINGS.map((pts, i) => (
        <polygon key={i} points={pts} fill="none" stroke="#e7e5e4" strokeWidth="1" />
      ))}

      {/* Axis lines */}
      {STAT_CONFIG.map(({ angle }) => {
        const { x, y } = polarToXY(angle, RADAR_R);
        return <line key={angle} x1={CX} y1={CY} x2={x} y2={y} stroke="#e7e5e4" strokeWidth="1" />;
      })}

      {/* Data polygon — scale from center on mount */}
      <g
        className={[
          'origin-[150px_150px]',
          'transition-[transform,opacity] duration-700',
          'ease-[cubic-bezier(0.34,1.56,0.64,1)]',
          visible ? 'scale-100 opacity-100' : 'scale-0 opacity-0',
        ].join(' ')}
      >
        <polygon
          points={polygon}
          fill="#818cf8"
          fillOpacity={0.2}
          stroke="#6366f1"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </g>

      {/* Stat labels and values */}
      {STAT_CONFIG.map(({ key, label, angle }) => {
        const { x, y } = polarToXY(angle, LABEL_R);
        const value = stats[key];
        const cosA = Math.cos(angle * DEG);
        const anchor = cosA > 0.3 ? 'start' : cosA < -0.3 ? 'end' : 'middle';
        return (
          <g key={key}>
            <text
              x={x}
              y={y - 4}
              textAnchor={anchor}
              fontSize="8.5"
              fontWeight="600"
              letterSpacing="0.8"
              fill="#a8a29e"
            >
              {label}
            </text>
            <text x={x} y={y + 9} textAnchor={anchor} fontSize="11" fontWeight="700" fill="#44403c">
              {value}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
