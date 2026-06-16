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
      className={`group relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-2xl border border-stone-200 bg-white pb-7 shadow-sm transition-[shadow,opacity] dark:border-stone-700 dark:bg-stone-900 ${
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

      {/* Build summary / configure button — always-visible footer bar */}
      <button
        type="button"
        onClick={() => onConfigure(member.id)}
        onPointerDown={(e) => e.stopPropagation()}
        aria-label={`${configureLabel} ${member.displayName}`}
        className={[
          'absolute inset-x-0 bottom-0 z-10 flex items-center justify-center gap-1 py-1.5 text-[11px] font-semibold leading-none transition-colors',
          hasBuild
            ? 'bg-emerald-500 text-white hover:bg-emerald-600'
            : 'bg-stone-800 text-white hover:bg-stone-700 dark:bg-stone-700 dark:hover:bg-stone-600',
        ].join(' ')}
      >
        <svg
          className="size-3 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.397-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
          />
        </svg>
        {hasBuild ? `Lv.${member.build!.level}` : configureLabel}
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
