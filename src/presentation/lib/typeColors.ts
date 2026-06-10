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
    badgeBg: 'bg-[#A8A77A]',
    badgeText: 'text-white',
    badgeBorder: 'border-transparent',
    accentBg: 'bg-[#A8A77A]',
    tintBg: 'bg-[#A8A77A]/[4%]',
    gradientBg: 'bg-[linear-gradient(135deg,#F3F4F6_0%,#F9FAFB_50%,#fafaf9_100%)]',
  },
  fire: {
    badgeBg: 'bg-[#EE8130]',
    badgeText: 'text-white',
    badgeBorder: 'border-transparent',
    accentBg: 'bg-[#EE8130]',
    tintBg: 'bg-[#EE8130]/[4%]',
    gradientBg: 'bg-[linear-gradient(135deg,#FFEDD5_0%,#FFF7ED_50%,#fafaf9_100%)]',
  },
  water: {
    badgeBg: 'bg-[#6390F0]',
    badgeText: 'text-white',
    badgeBorder: 'border-transparent',
    accentBg: 'bg-[#6390F0]',
    tintBg: 'bg-[#6390F0]/[4%]',
    gradientBg: 'bg-[linear-gradient(135deg,#DBEAFE_0%,#EFF6FF_50%,#fafaf9_100%)]',
  },
  electric: {
    badgeBg: 'bg-[#F7D02C]',
    badgeText: 'text-white',
    badgeBorder: 'border-transparent',
    accentBg: 'bg-[#F7D02C]',
    tintBg: 'bg-[#F7D02C]/[4%]',
    gradientBg: 'bg-[linear-gradient(135deg,#FEF9C3_0%,#FEFCE8_50%,#fafaf9_100%)]',
  },
  grass: {
    badgeBg: 'bg-[#7AC74C]',
    badgeText: 'text-white',
    badgeBorder: 'border-transparent',
    accentBg: 'bg-[#7AC74C]',
    tintBg: 'bg-[#7AC74C]/[4%]',
    gradientBg: 'bg-[linear-gradient(135deg,#DCFCE7_0%,#F0FDF4_50%,#fafaf9_100%)]',
  },
  ice: {
    badgeBg: 'bg-[#96D9D6]',
    badgeText: 'text-white',
    badgeBorder: 'border-transparent',
    accentBg: 'bg-[#96D9D6]',
    tintBg: 'bg-[#96D9D6]/[4%]',
    gradientBg: 'bg-[linear-gradient(135deg,#CFFAFE_0%,#ECFEFF_50%,#fafaf9_100%)]',
  },
  fighting: {
    badgeBg: 'bg-[#C22E28]',
    badgeText: 'text-white',
    badgeBorder: 'border-transparent',
    accentBg: 'bg-[#C22E28]',
    tintBg: 'bg-[#C22E28]/[4%]',
    gradientBg: 'bg-[linear-gradient(135deg,#FEE2E2_0%,#FEF2F2_50%,#fafaf9_100%)]',
  },
  poison: {
    badgeBg: 'bg-[#A33EA1]',
    badgeText: 'text-white',
    badgeBorder: 'border-transparent',
    accentBg: 'bg-[#A33EA1]',
    tintBg: 'bg-[#A33EA1]/[4%]',
    gradientBg: 'bg-[linear-gradient(135deg,#F3E8FF_0%,#FAF5FF_50%,#fafaf9_100%)]',
  },
  ground: {
    badgeBg: 'bg-[#E2BF65]',
    badgeText: 'text-white',
    badgeBorder: 'border-transparent',
    accentBg: 'bg-[#E2BF65]',
    tintBg: 'bg-[#E2BF65]/[4%]',
    gradientBg: 'bg-[linear-gradient(135deg,#FEF3C7_0%,#FFFBEB_50%,#fafaf9_100%)]',
  },
  flying: {
    badgeBg: 'bg-[#A98FF3]',
    badgeText: 'text-white',
    badgeBorder: 'border-transparent',
    accentBg: 'bg-[#A98FF3]',
    tintBg: 'bg-[#A98FF3]/[4%]',
    gradientBg: 'bg-[linear-gradient(135deg,#E0E7FF_0%,#EEF2FF_50%,#fafaf9_100%)]',
  },
  psychic: {
    badgeBg: 'bg-[#F95587]',
    badgeText: 'text-white',
    badgeBorder: 'border-transparent',
    accentBg: 'bg-[#F95587]',
    tintBg: 'bg-[#F95587]/[4%]',
    gradientBg: 'bg-[linear-gradient(135deg,#FCE7F3_0%,#FDF2F8_50%,#fafaf9_100%)]',
  },
  bug: {
    badgeBg: 'bg-[#A6B91A]',
    badgeText: 'text-white',
    badgeBorder: 'border-transparent',
    accentBg: 'bg-[#A6B91A]',
    tintBg: 'bg-[#A6B91A]/[4%]',
    gradientBg: 'bg-[linear-gradient(135deg,#ECFCCB_0%,#F7FEE7_50%,#fafaf9_100%)]',
  },
  rock: {
    badgeBg: 'bg-[#B6A136]',
    badgeText: 'text-white',
    badgeBorder: 'border-transparent',
    accentBg: 'bg-[#B6A136]',
    tintBg: 'bg-[#B6A136]/[4%]',
    gradientBg: 'bg-[linear-gradient(135deg,#F5F5F4_0%,#FAFAF9_50%,#fafaf9_100%)]',
  },
  ghost: {
    badgeBg: 'bg-[#735797]',
    badgeText: 'text-white',
    badgeBorder: 'border-transparent',
    accentBg: 'bg-[#735797]',
    tintBg: 'bg-[#735797]/[4%]',
    gradientBg: 'bg-[linear-gradient(135deg,#EDE9FE_0%,#F5F3FF_50%,#fafaf9_100%)]',
  },
  dragon: {
    badgeBg: 'bg-[#6F35FC]',
    badgeText: 'text-white',
    badgeBorder: 'border-transparent',
    accentBg: 'bg-[#6F35FC]',
    tintBg: 'bg-[#6F35FC]/[4%]',
    gradientBg: 'bg-[linear-gradient(135deg,#E0E7FF_0%,#EEF2FF_50%,#fafaf9_100%)]',
  },
  dark: {
    badgeBg: 'bg-[#705746]',
    badgeText: 'text-white',
    badgeBorder: 'border-transparent',
    accentBg: 'bg-[#705746]',
    tintBg: 'bg-[#705746]/[4%]',
    gradientBg: 'bg-[linear-gradient(135deg,#F3F4F6_0%,#F9FAFB_50%,#fafaf9_100%)]',
  },
  steel: {
    badgeBg: 'bg-[#B7B7CE]',
    badgeText: 'text-white',
    badgeBorder: 'border-transparent',
    accentBg: 'bg-[#B7B7CE]',
    tintBg: 'bg-[#B7B7CE]/[4%]',
    gradientBg: 'bg-[linear-gradient(135deg,#F1F5F9_0%,#F8FAFC_50%,#fafaf9_100%)]',
  },
  fairy: {
    badgeBg: 'bg-[#D685AD]',
    badgeText: 'text-white',
    badgeBorder: 'border-transparent',
    accentBg: 'bg-[#D685AD]',
    tintBg: 'bg-[#D685AD]/[4%]',
    gradientBg: 'bg-[linear-gradient(135deg,#FCE7F3_0%,#FDF2F8_50%,#fafaf9_100%)]',
  },
};

export function getPrimaryTypeClasses(types: readonly PokemonType[]): TypeClasses {
  return TYPE_CLASSES[types[0] ?? 'normal'];
}
