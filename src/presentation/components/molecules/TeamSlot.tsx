'use client';

import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { TypeBadge } from '@/presentation/components/atoms/TypeBadge';
import { getPrimaryTypeClasses } from '@/presentation/lib/typeColors';
import type { TeamMember } from '@/presentation/store/teamBuilderStore';
import type { PokemonType } from '@/domain/entities/Pokemon';

interface EmptySlotProps {
  label: string;
  onAdd?: () => void;
}

function EmptySlot({ label, onAdd }: EmptySlotProps) {
  return (
    <button
      type="button"
      onClick={onAdd}
      aria-label={label}
      className="flex aspect-square w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50 text-stone-300 transition-colors hover:border-stone-400 hover:bg-stone-100 hover:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-600 dark:hover:border-stone-500 dark:hover:bg-stone-800 dark:hover:text-stone-500"
    >
      <svg
        className="size-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    </button>
  );
}

interface FilledSlotProps {
  member: TeamMember;
  typeLabels: Record<PokemonType, string>;
  removeLabel: string;
  configureLabel: string;
  onRemove: (id: number) => void;
  onConfigure: (id: number) => void;
  priority?: boolean;
  isDragging?: boolean;
}

function FilledSlot({
  member,
  typeLabels,
  removeLabel,
  configureLabel,
  onRemove,
  onConfigure,
  priority = false,
  isDragging = false,
}: FilledSlotProps) {
  const tc = getPrimaryTypeClasses(member.types);
  const hasBuild = Boolean(member.build);

  return (
    <div
      className={`group relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-[shadow,opacity] dark:border-stone-700 dark:bg-stone-900 ${
        isDragging ? 'opacity-40' : 'hover:shadow-md'
      }`}
    >
      <div className={`absolute inset-0 opacity-30 ${tc.gradientBg}`} />

      <Link
        href={`/pokemon/${member.id}?from=team`}
        onPointerDown={(e) => e.stopPropagation()}
        aria-label={member.displayName}
        className="absolute left-1.5 top-1.5 z-10 flex size-5 items-center justify-center rounded-full bg-stone-900/70 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
      >
        <svg
          className="size-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"
          />
        </svg>
      </Link>

      <button
        type="button"
        onClick={() => onRemove(member.id)}
        onPointerDown={(e) => e.stopPropagation()}
        aria-label={`${removeLabel} ${member.displayName}`}
        className="absolute right-1.5 top-1.5 z-10 flex size-5 items-center justify-center rounded-full bg-stone-900/70 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
      >
        <svg
          className="size-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="relative size-16 sm:size-20">
        <Image
          src={member.sprite}
          alt={member.displayName}
          fill
          sizes="80px"
          priority={priority}
          loading={priority ? undefined : 'lazy'}
          className="object-contain drop-shadow-sm"
        />
      </div>

      <p className="relative mt-1 px-1 text-center font-display text-sm font-bold leading-tight tracking-tight text-stone-800 dark:text-stone-200">
        {member.displayName}
      </p>

      <div className="relative mt-1 flex flex-wrap justify-center gap-1 px-1">
        {member.types.map((t) => (
          <TypeBadge key={t} type={t} size="sm" label={typeLabels[t]} />
        ))}
      </div>

      {/* Build summary / configure button */}
      <button
        type="button"
        onClick={() => onConfigure(member.id)}
        onPointerDown={(e) => e.stopPropagation()}
        aria-label={`${configureLabel} ${member.displayName}`}
        className={[
          'absolute bottom-1.5 left-1/2 z-10 -translate-x-1/2 rounded-full px-2 py-0.5 text-[10px] font-medium leading-none transition-opacity',
          hasBuild
            ? 'bg-emerald-500/90 text-white'
            : 'bg-stone-900/60 text-white opacity-0 group-hover:opacity-100 focus-visible:opacity-100',
        ].join(' ')}
      >
        {hasBuild ? `Lv.${member.build!.level}` : '⚙'}
      </button>
    </div>
  );
}

interface TeamSlotProps {
  member?: TeamMember;
  typeLabels: Record<PokemonType, string>;
  emptyLabel: string;
  removeLabel: string;
  configureLabel: string;
  onRemove: (id: number) => void;
  onConfigure: (id: number) => void;
  onAdd?: () => void;
  priority?: boolean;
  isDragging?: boolean;
}

export function TeamSlot({
  member,
  typeLabels,
  emptyLabel,
  removeLabel,
  configureLabel,
  onRemove,
  onConfigure,
  onAdd,
  priority,
  isDragging,
}: TeamSlotProps) {
  if (!member) return <EmptySlot label={emptyLabel} onAdd={onAdd} />;
  return (
    <FilledSlot
      member={member}
      typeLabels={typeLabels}
      removeLabel={removeLabel}
      configureLabel={configureLabel}
      onRemove={onRemove}
      onConfigure={onConfigure}
      priority={priority}
      isDragging={isDragging}
    />
  );
}
