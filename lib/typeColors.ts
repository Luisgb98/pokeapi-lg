import type { PokemonType } from '../domain/entities/Pokemon';

export interface TypeColorConfig {
  accent: string;
  subtle: string;
  shadow: string;
  text: string;
  badge: string;
}

export const TYPE_COLORS: Record<PokemonType, TypeColorConfig> = {
  normal: {
    accent: '#9CA3AF',
    subtle: '#F9FAFB',
    shadow: 'rgba(156,163,175,0.35)',
    text: '#374151',
    badge: '#F3F4F6',
  },
  fire: {
    accent: '#F97316',
    subtle: '#FFF7ED',
    shadow: 'rgba(249,115,22,0.35)',
    text: '#7C2D12',
    badge: '#FFEDD5',
  },
  water: {
    accent: '#3B82F6',
    subtle: '#EFF6FF',
    shadow: 'rgba(59,130,246,0.35)',
    text: '#1E3A8A',
    badge: '#DBEAFE',
  },
  electric: {
    accent: '#EAB308',
    subtle: '#FEFCE8',
    shadow: 'rgba(234,179,8,0.35)',
    text: '#713F12',
    badge: '#FEF9C3',
  },
  grass: {
    accent: '#22C55E',
    subtle: '#F0FDF4',
    shadow: 'rgba(34,197,94,0.35)',
    text: '#14532D',
    badge: '#DCFCE7',
  },
  ice: {
    accent: '#06B6D4',
    subtle: '#ECFEFF',
    shadow: 'rgba(6,182,212,0.35)',
    text: '#164E63',
    badge: '#CFFAFE',
  },
  fighting: {
    accent: '#EF4444',
    subtle: '#FEF2F2',
    shadow: 'rgba(239,68,68,0.35)',
    text: '#7F1D1D',
    badge: '#FEE2E2',
  },
  poison: {
    accent: '#A855F7',
    subtle: '#FAF5FF',
    shadow: 'rgba(168,85,247,0.35)',
    text: '#581C87',
    badge: '#F3E8FF',
  },
  ground: {
    accent: '#D97706',
    subtle: '#FFFBEB',
    shadow: 'rgba(217,119,6,0.35)',
    text: '#78350F',
    badge: '#FEF3C7',
  },
  flying: {
    accent: '#818CF8',
    subtle: '#EEF2FF',
    shadow: 'rgba(129,140,248,0.35)',
    text: '#312E81',
    badge: '#E0E7FF',
  },
  psychic: {
    accent: '#EC4899',
    subtle: '#FDF2F8',
    shadow: 'rgba(236,72,153,0.35)',
    text: '#831843',
    badge: '#FCE7F3',
  },
  bug: {
    accent: '#84CC16',
    subtle: '#F7FEE7',
    shadow: 'rgba(132,204,22,0.35)',
    text: '#365314',
    badge: '#ECFCCB',
  },
  rock: {
    accent: '#A8743A',
    subtle: '#FAFAF9',
    shadow: 'rgba(168,116,58,0.35)',
    text: '#44403C',
    badge: '#F5F5F4',
  },
  ghost: {
    accent: '#7C3AED',
    subtle: '#F5F3FF',
    shadow: 'rgba(124,58,237,0.35)',
    text: '#4C1D95',
    badge: '#EDE9FE',
  },
  dragon: {
    accent: '#6366F1',
    subtle: '#EEF2FF',
    shadow: 'rgba(99,102,241,0.35)',
    text: '#312E81',
    badge: '#E0E7FF',
  },
  dark: {
    accent: '#374151',
    subtle: '#F9FAFB',
    shadow: 'rgba(55,65,81,0.35)',
    text: '#111827',
    badge: '#F3F4F6',
  },
  steel: {
    accent: '#64748B',
    subtle: '#F8FAFC',
    shadow: 'rgba(100,116,139,0.35)',
    text: '#1E293B',
    badge: '#F1F5F9',
  },
  fairy: {
    accent: '#F472B6',
    subtle: '#FDF2F8',
    shadow: 'rgba(244,114,182,0.35)',
    text: '#831843',
    badge: '#FCE7F3',
  },
};

export function getPrimaryTypeColor(types: readonly PokemonType[]): TypeColorConfig {
  return TYPE_COLORS[types[0] ?? 'normal'];
}
