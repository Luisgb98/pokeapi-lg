import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/presentation/lib/utils';
import type { EvolutionNode as EvolutionNodeType } from '@/domain/entities/EvolutionChain';

interface EvolutionNodeProps {
  node: EvolutionNodeType;
  currentId: number;
  isFirst?: boolean;
}

export function EvolutionNode({ node, currentId, isFirst = false }: EvolutionNodeProps) {
  const isCurrent = node.id === currentId;

  return (
    <div className="flex items-center gap-2">
      {!isFirst && (
        <div className="flex flex-col items-center gap-0.5 px-1">
          <svg
            className="size-5 shrink-0 text-stone-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      )}

      <Link
        href={`/pokemon/${node.id}`}
        className={cn(
          'group flex flex-col items-center gap-1.5 rounded-2xl border-2 p-3 transition-all duration-200',
          isCurrent
            ? 'border-stone-900 bg-stone-50 shadow-md'
            : 'border-transparent hover:border-stone-200 hover:bg-stone-50',
        )}
        aria-current={isCurrent ? 'page' : undefined}
      >
        <div
          className={cn(
            'relative size-16 transition-transform duration-200',
            !isCurrent && 'group-hover:scale-110',
          )}
        >
          <Image
            src={node.sprite}
            alt={node.displayName}
            fill
            sizes="64px"
            className="object-contain drop-shadow-sm"
          />
        </div>
        <span
          className={cn(
            'text-xs font-semibold tracking-tight',
            isCurrent ? 'font-display text-stone-900' : 'text-stone-500 group-hover:text-stone-700',
          )}
        >
          {node.displayName}
        </span>
        {isCurrent && (
          <span className="rounded-full bg-stone-900 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">
            Current
          </span>
        )}
      </Link>

      {/* Render sub-evolutions recursively */}
      {node.evolvesTo.map((child) => (
        <EvolutionNode key={child.id} node={child} currentId={currentId} />
      ))}
    </div>
  );
}
