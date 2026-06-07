'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TeamSlot } from '@/presentation/components/molecules/TeamSlot';
import type { TeamMember } from '@/presentation/store/teamBuilderStore';
import type { PokemonType } from '@/domain/entities/Pokemon';

interface SortableTeamSlotProps {
  member: TeamMember;
  typeLabels: Record<PokemonType, string>;
  removeLabel: string;
  onRemove: (id: number) => void;
  priority?: boolean;
}

export function SortableTeamSlot({
  member,
  typeLabels,
  removeLabel,
  onRemove,
  priority,
}: SortableTeamSlotProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: member.id,
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : undefined,
      }}
      className={isDragging ? 'cursor-grabbing' : 'cursor-grab'}
    >
      <TeamSlot
        member={member}
        typeLabels={typeLabels}
        emptyLabel=""
        removeLabel={removeLabel}
        onRemove={onRemove}
        priority={priority}
        isDragging={isDragging}
      />
    </div>
  );
}
