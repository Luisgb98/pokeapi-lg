'use client';

import { useTranslations } from 'next-intl';
import { EvolutionNode } from '@/presentation/components/molecules/EvolutionNode';
import type { EvolutionChain } from '@/domain/entities/EvolutionChain';

interface EvolutionChainViewProps {
  chain: EvolutionChain;
  currentId: number;
}

export function EvolutionChainView({ chain, currentId }: EvolutionChainViewProps) {
  const t = useTranslations('detail');
  return (
    <div>
      <h2 className="mb-5 font-display text-sm font-bold uppercase tracking-[0.15em] text-stone-400">
        {t('evolutionChain')}
      </h2>
      <div className="sm:overflow-x-auto">
        <div className="flex flex-col items-center sm:min-w-max sm:flex-row sm:gap-1 sm:pb-2">
          <EvolutionNode node={chain.chain} currentId={currentId} isFirst />
        </div>
      </div>
    </div>
  );
}
