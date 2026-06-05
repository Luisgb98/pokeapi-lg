import type { PokemonType } from '@/domain/entities/Pokemon';

export interface TypeClasses {
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  accentBg: string;
  tintBg: string;
  gradientBg: string;
}

export const TYPE_CLASSES: Record<PokemonType, TypeClasses> = {
  normal: {
    badgeBg: 'bg-[#F3F4F6]',
    badgeText: 'text-[#374151]',
    badgeBorder: 'border-[#9CA3AF]/20',
    accentBg: 'bg-[#9CA3AF]',
    tintBg: 'bg-[#9CA3AF]/[2%]',
    gradientBg: 'bg-[linear-gradient(135deg,#F3F4F6_0%,#F9FAFB_50%,#fafaf9_100%)]',
  },
  fire: {
    badgeBg: 'bg-[#FFEDD5]',
    badgeText: 'text-[#7C2D12]',
    badgeBorder: 'border-[#F97316]/20',
    accentBg: 'bg-[#F97316]',
    tintBg: 'bg-[#F97316]/[2%]',
    gradientBg: 'bg-[linear-gradient(135deg,#FFEDD5_0%,#FFF7ED_50%,#fafaf9_100%)]',
  },
  water: {
    badgeBg: 'bg-[#DBEAFE]',
    badgeText: 'text-[#1E3A8A]',
    badgeBorder: 'border-[#3B82F6]/20',
    accentBg: 'bg-[#3B82F6]',
    tintBg: 'bg-[#3B82F6]/[2%]',
    gradientBg: 'bg-[linear-gradient(135deg,#DBEAFE_0%,#EFF6FF_50%,#fafaf9_100%)]',
  },
  electric: {
    badgeBg: 'bg-[#FEF9C3]',
    badgeText: 'text-[#713F12]',
    badgeBorder: 'border-[#EAB308]/20',
    accentBg: 'bg-[#EAB308]',
    tintBg: 'bg-[#EAB308]/[2%]',
    gradientBg: 'bg-[linear-gradient(135deg,#FEF9C3_0%,#FEFCE8_50%,#fafaf9_100%)]',
  },
  grass: {
    badgeBg: 'bg-[#DCFCE7]',
    badgeText: 'text-[#14532D]',
    badgeBorder: 'border-[#22C55E]/20',
    accentBg: 'bg-[#22C55E]',
    tintBg: 'bg-[#22C55E]/[2%]',
    gradientBg: 'bg-[linear-gradient(135deg,#DCFCE7_0%,#F0FDF4_50%,#fafaf9_100%)]',
  },
  ice: {
    badgeBg: 'bg-[#CFFAFE]',
    badgeText: 'text-[#164E63]',
    badgeBorder: 'border-[#06B6D4]/20',
    accentBg: 'bg-[#06B6D4]',
    tintBg: 'bg-[#06B6D4]/[2%]',
    gradientBg: 'bg-[linear-gradient(135deg,#CFFAFE_0%,#ECFEFF_50%,#fafaf9_100%)]',
  },
  fighting: {
    badgeBg: 'bg-[#FEE2E2]',
    badgeText: 'text-[#7F1D1D]',
    badgeBorder: 'border-[#EF4444]/20',
    accentBg: 'bg-[#EF4444]',
    tintBg: 'bg-[#EF4444]/[2%]',
    gradientBg: 'bg-[linear-gradient(135deg,#FEE2E2_0%,#FEF2F2_50%,#fafaf9_100%)]',
  },
  poison: {
    badgeBg: 'bg-[#F3E8FF]',
    badgeText: 'text-[#581C87]',
    badgeBorder: 'border-[#A855F7]/20',
    accentBg: 'bg-[#A855F7]',
    tintBg: 'bg-[#A855F7]/[2%]',
    gradientBg: 'bg-[linear-gradient(135deg,#F3E8FF_0%,#FAF5FF_50%,#fafaf9_100%)]',
  },
  ground: {
    badgeBg: 'bg-[#FEF3C7]',
    badgeText: 'text-[#78350F]',
    badgeBorder: 'border-[#D97706]/20',
    accentBg: 'bg-[#D97706]',
    tintBg: 'bg-[#D97706]/[2%]',
    gradientBg: 'bg-[linear-gradient(135deg,#FEF3C7_0%,#FFFBEB_50%,#fafaf9_100%)]',
  },
  flying: {
    badgeBg: 'bg-[#E0E7FF]',
    badgeText: 'text-[#312E81]',
    badgeBorder: 'border-[#818CF8]/20',
    accentBg: 'bg-[#818CF8]',
    tintBg: 'bg-[#818CF8]/[2%]',
    gradientBg: 'bg-[linear-gradient(135deg,#E0E7FF_0%,#EEF2FF_50%,#fafaf9_100%)]',
  },
  psychic: {
    badgeBg: 'bg-[#FCE7F3]',
    badgeText: 'text-[#831843]',
    badgeBorder: 'border-[#EC4899]/20',
    accentBg: 'bg-[#EC4899]',
    tintBg: 'bg-[#EC4899]/[2%]',
    gradientBg: 'bg-[linear-gradient(135deg,#FCE7F3_0%,#FDF2F8_50%,#fafaf9_100%)]',
  },
  bug: {
    badgeBg: 'bg-[#ECFCCB]',
    badgeText: 'text-[#365314]',
    badgeBorder: 'border-[#84CC16]/20',
    accentBg: 'bg-[#84CC16]',
    tintBg: 'bg-[#84CC16]/[2%]',
    gradientBg: 'bg-[linear-gradient(135deg,#ECFCCB_0%,#F7FEE7_50%,#fafaf9_100%)]',
  },
  rock: {
    badgeBg: 'bg-[#F5F5F4]',
    badgeText: 'text-[#44403C]',
    badgeBorder: 'border-[#A8743A]/20',
    accentBg: 'bg-[#A8743A]',
    tintBg: 'bg-[#A8743A]/[2%]',
    gradientBg: 'bg-[linear-gradient(135deg,#F5F5F4_0%,#FAFAF9_50%,#fafaf9_100%)]',
  },
  ghost: {
    badgeBg: 'bg-[#EDE9FE]',
    badgeText: 'text-[#4C1D95]',
    badgeBorder: 'border-[#7C3AED]/20',
    accentBg: 'bg-[#7C3AED]',
    tintBg: 'bg-[#7C3AED]/[2%]',
    gradientBg: 'bg-[linear-gradient(135deg,#EDE9FE_0%,#F5F3FF_50%,#fafaf9_100%)]',
  },
  dragon: {
    badgeBg: 'bg-[#E0E7FF]',
    badgeText: 'text-[#312E81]',
    badgeBorder: 'border-[#6366F1]/20',
    accentBg: 'bg-[#6366F1]',
    tintBg: 'bg-[#6366F1]/[2%]',
    gradientBg: 'bg-[linear-gradient(135deg,#E0E7FF_0%,#EEF2FF_50%,#fafaf9_100%)]',
  },
  dark: {
    badgeBg: 'bg-[#F3F4F6]',
    badgeText: 'text-[#111827]',
    badgeBorder: 'border-[#374151]/20',
    accentBg: 'bg-[#374151]',
    tintBg: 'bg-[#374151]/[2%]',
    gradientBg: 'bg-[linear-gradient(135deg,#F3F4F6_0%,#F9FAFB_50%,#fafaf9_100%)]',
  },
  steel: {
    badgeBg: 'bg-[#F1F5F9]',
    badgeText: 'text-[#1E293B]',
    badgeBorder: 'border-[#64748B]/20',
    accentBg: 'bg-[#64748B]',
    tintBg: 'bg-[#64748B]/[2%]',
    gradientBg: 'bg-[linear-gradient(135deg,#F1F5F9_0%,#F8FAFC_50%,#fafaf9_100%)]',
  },
  fairy: {
    badgeBg: 'bg-[#FCE7F3]',
    badgeText: 'text-[#831843]',
    badgeBorder: 'border-[#F472B6]/20',
    accentBg: 'bg-[#F472B6]',
    tintBg: 'bg-[#F472B6]/[2%]',
    gradientBg: 'bg-[linear-gradient(135deg,#FCE7F3_0%,#FDF2F8_50%,#fafaf9_100%)]',
  },
};

export function getPrimaryTypeClasses(types: readonly PokemonType[]): TypeClasses {
  return TYPE_CLASSES[types[0] ?? 'normal'];
}
