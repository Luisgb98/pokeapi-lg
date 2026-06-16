'use client';

import { useState, useCallback, useEffect, useRef, useTransition } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { fetchPokemonById } from '@/application/actions/pokemon';
import type { Pokemon } from '@/domain/entities/Pokemon';
import { useFavoritesStore } from '@/presentation/store/favoritesStore';
import { useHydration } from '@/presentation/hooks/useHydration';
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
import type { TeamMemberBuild } from '@/domain/entities/TeamMemberBuild';
import { TeamMemberBuildModal } from '@/presentation/components/organisms/TeamMemberBuildModal';
import { TeamShareButton } from '@/presentation/components/organisms/TeamShareButton';
import { TeamSlot } from '@/presentation/components/molecules/TeamSlot';
import { SortableTeamSlot } from '@/presentation/components/molecules/SortableTeamSlot';
import { PokemonPickerModal } from '@/presentation/components/organisms/PokemonPickerModal';
import { TeamCoverageDisplay } from '@/presentation/components/organisms/TeamCoverageDisplay';
import { OffensiveCoverageDisplay } from '@/presentation/components/organisms/OffensiveCoverageDisplay';
import { FullTypeChart } from '@/presentation/components/organisms/FullTypeChart';
import { getPrimaryTypeClasses } from '@/presentation/lib/typeColors';
import { Button } from '@/presentation/components/ui/button';
import type { PokemonType } from '@/domain/entities/Pokemon';

interface TeamBuilderProps {
  typeLabels: Record<PokemonType, string>;
  sharedMembers?: TeamMember[];
}

function DragOverlayCard({ member }: { member: TeamMember }) {
  const tc = getPrimaryTypeClasses(member.types);
  return (
    <div className="flex aspect-square flex-col items-center justify-center overflow-hidden rounded-2xl border border-stone-300 bg-white shadow-2xl ring-2 ring-stone-900/10 dark:border-stone-600 dark:bg-stone-900 dark:ring-stone-400/10">
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
      <p className="relative mt-1 px-1 text-center font-display text-[10px] font-bold leading-tight tracking-tight text-stone-800 dark:text-stone-200">
        {member.displayName}
      </p>
    </div>
  );
}

export function TeamBuilder({ typeLabels, sharedMembers = [] }: TeamBuilderProps) {
  const t = useTranslations('teamBuilder');
  const tBuild = useTranslations('teamBuild');
  const locale = useLocale();
  const router = useRouter();
  const { team, removeMember, reorderTeam, clear, addMember, addMembers, setMemberBuild } =
    useTeamBuilderStore();
  const favoriteIds = useFavoritesStore((s) => s.ids);
  const hydrated = useHydration();
  const [isImporting, startImporting] = useTransition();

  const sharedLoadedRef = useRef(false);
  useEffect(() => {
    if (sharedLoadedRef.current || sharedMembers.length === 0) return;
    sharedLoadedRef.current = true;
    clear();
    for (const member of sharedMembers) {
      addMember(member);
    }
    router.replace(`/${locale}/team`, { scroll: false });
  }, [sharedMembers, clear, addMember, router, locale]);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [configuringId, setConfiguringId] = useState<number | null>(null);

  const configuringMember =
    configuringId !== null ? team.find((m) => m.id === configuringId) : undefined;

  function handleBuildSave(build: TeamMemberBuild) {
    if (configuringId !== null) setMemberBuild(configuringId, build);
    setConfiguringId(null);
  }

  const isFull = team.length >= TEAM_MAX_SIZE;
  const freeSlots = TEAM_MAX_SIZE - team.length;
  const importableIds = favoriteIds
    .filter((id) => !team.some((m) => m.id === id))
    .slice(0, freeSlots);

  const handleAddFavorites = () => {
    startImporting(async () => {
      const results = await Promise.allSettled(importableIds.map((id) => fetchPokemonById(id)));
      const members = results
        .filter((r): r is PromiseFulfilledResult<Pokemon> => r.status === 'fulfilled')
        .map(({ value: p }) => ({
          id: p.id,
          name: p.name,
          displayName: p.displayName,
          types: p.types,
          sprite: p.sprite,
        }));
      addMembers(members);
    });
  };
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
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-6">
              {slots.map((member, i) =>
                member ? (
                  <SortableTeamSlot
                    key={member.id}
                    member={member}
                    typeLabels={typeLabels}
                    removeLabel={t('removeFromTeam')}
                    configureLabel={tBuild('configureShort')}
                    onRemove={removeMember}
                    onConfigure={setConfiguringId}
                    priority={i < 2}
                  />
                ) : (
                  <TeamSlot
                    key={`empty-${i}`}
                    member={undefined}
                    typeLabels={typeLabels}
                    emptyLabel={t('emptySlot')}
                    removeLabel=""
                    configureLabel=""
                    onRemove={() => {}}
                    onConfigure={() => {}}
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

        <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-stone-100 pt-4 dark:border-stone-800">
          <Button
            type="button"
            onClick={handleAddFavorites}
            disabled={!hydrated || isImporting || isFull || importableIds.length === 0}
            variant="outline"
            size="sm"
          >
            <svg
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5z"
              />
            </svg>
            {t('addFavorites')}
          </Button>
          {team.length > 0 && <TeamShareButton />}
          {team.length > 0 && (
            <Button
              type="button"
              onClick={clear}
              variant="ghost"
              size="sm"
              className="text-stone-500 hover:bg-red-50 hover:text-red-600 dark:text-stone-400 dark:hover:bg-red-950/40 dark:hover:text-red-400"
            >
              <svg
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                />
              </svg>
              {t('clearTeam')}
            </Button>
          )}
        </div>
      </section>

      {/* Coverage */}
      {team.length > 0 ? (
        <>
          <TeamCoverageDisplay
            teamTypes={teamTypes}
            typeLabels={typeLabels}
            title={t('teamCoverage')}
          />
          <OffensiveCoverageDisplay
            teamTypes={teamTypes}
            typeLabels={typeLabels}
            title={t('offenseTitle')}
            subtitle={t('offenseSubtitle')}
            gapsLabel={t('offenseGaps')}
            noGapsLabel={t('offenseNoGaps')}
          />
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-stone-200 py-12 text-center dark:border-stone-700">
          <p className="text-sm text-stone-400 dark:text-stone-500">{t('noTeam')}</p>
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

      <PokemonPickerModal open={pickerOpen} onClose={() => setPickerOpen(false)} />
      {configuringMember && (
        <TeamMemberBuildModal
          member={configuringMember}
          onSave={handleBuildSave}
          onClose={() => setConfiguringId(null)}
        />
      )}
    </div>
  );
}
