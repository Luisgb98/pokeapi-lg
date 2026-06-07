'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { useTeamBuilderStore, TEAM_MAX_SIZE } from '@/presentation/store/teamBuilderStore';
import type { TeamMember } from '@/presentation/store/teamBuilderStore';
import { TeamSlot } from '@/presentation/components/molecules/TeamSlot';
import { SortableTeamSlot } from '@/presentation/components/molecules/SortableTeamSlot';
import { PokemonPickerModal } from '@/presentation/components/organisms/PokemonPickerModal';
import { TeamCoverageDisplay } from '@/presentation/components/organisms/TeamCoverageDisplay';
import { FullTypeChart } from '@/presentation/components/organisms/FullTypeChart';
import { getPrimaryTypeClasses } from '@/presentation/lib/typeColors';
import type { PokemonType } from '@/domain/entities/Pokemon';

interface TeamBuilderProps {
  typeLabels: Record<PokemonType, string>;
}

function DragOverlayCard({ member }: { member: TeamMember }) {
  const tc = getPrimaryTypeClasses(member.types);
  return (
    <div className="flex aspect-square flex-col items-center justify-center overflow-hidden rounded-2xl border border-stone-300 bg-white shadow-2xl ring-2 ring-stone-900/10">
      <div className={`absolute inset-0 opacity-30 ${tc.gradientBg}`} />
      <div className="relative size-16 sm:size-20">
        <Image
          src={member.sprite}
          alt={member.displayName}
          fill
          sizes="80px"
          className="object-contain drop-shadow-sm"
        />
      </div>
      <p className="relative mt-1 px-1 text-center font-display text-[10px] font-bold leading-tight tracking-tight text-stone-800">
        {member.displayName}
      </p>
    </div>
  );
}

export function TeamBuilder({ typeLabels }: TeamBuilderProps) {
  const t = useTranslations('teamBuilder');
  const { team, removeMember, reorderTeam, clear } = useTeamBuilderStore();

  const [pickerOpen, setPickerOpen] = useState(false);
  const [activeId, setActiveId] = useState<number | null>(null);

  const isFull = team.length >= TEAM_MAX_SIZE;
  const slots = Array.from({ length: TEAM_MAX_SIZE }, (_, i) => team[i] as TeamMember | undefined);
  const activeItem = activeId !== null ? team.find((m) => m.id === activeId) : undefined;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as number);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const fromIndex = team.findIndex((m) => m.id === active.id);
      const toIndex = team.findIndex((m) => m.id === over.id);
      if (fromIndex !== -1 && toIndex !== -1) reorderTeam(fromIndex, toIndex);
    },
    [team, reorderTeam],
  );

  const teamTypes = team.map((m) => m.types);

  return (
    <div className="space-y-6">
      {/* Team slots */}
      <section aria-label={t('heading')}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={team.map((m) => m.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
              {slots.map((member, i) =>
                member ? (
                  <SortableTeamSlot
                    key={member.id}
                    member={member}
                    typeLabels={typeLabels}
                    removeLabel={t('removeFromTeam')}
                    onRemove={removeMember}
                    priority={i < 2}
                  />
                ) : (
                  <TeamSlot
                    key={`empty-${i}`}
                    member={undefined}
                    typeLabels={typeLabels}
                    emptyLabel={t('emptySlot')}
                    removeLabel=""
                    onRemove={() => {}}
                    onAdd={isFull ? undefined : () => setPickerOpen(true)}
                  />
                ),
              )}
            </div>
          </SortableContext>

          <DragOverlay
            dropAnimation={{ duration: 150, easing: 'cubic-bezier(0.18,0.67,0.6,1.22)' }}
          >
            {activeItem ? <DragOverlayCard member={activeItem} /> : null}
          </DragOverlay>
        </DndContext>

        {team.length > 0 && (
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={clear}
              className="text-xs font-medium text-stone-400 transition-colors hover:text-red-500"
            >
              {t('clearTeam')}
            </button>
          </div>
        )}
      </section>

      {/* Coverage */}
      {team.length > 0 ? (
        <TeamCoverageDisplay
          teamTypes={teamTypes}
          typeLabels={typeLabels}
          title={t('teamCoverage')}
        />
      ) : (
        <div className="rounded-2xl border border-dashed border-stone-200 py-12 text-center">
          <p className="text-sm text-stone-400">{t('noTeam')}</p>
        </div>
      )}

      {/* Full type chart */}
      <FullTypeChart
        typeLabels={typeLabels}
        title={t('fullTypeChart')}
        subtitle={t('fullTypeChartSubtitle')}
        attackLabel={t('attack')}
        defenseLabel={t('defense')}
      />

      <PokemonPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        typeLabels={typeLabels}
      />
    </div>
  );
}
