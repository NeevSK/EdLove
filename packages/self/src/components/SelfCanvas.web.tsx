import type { AccessibleFeature } from '@repo/self/features/accessPolicy';
import { SelfFeatureRenderer } from '@repo/self/components/SelfFeatureRenderer';
import { SettingsGroup } from '@repo/ui/components/SettingsGroup';
import { WebDraggableCanvasSurface } from '@repo/ui/components/workspace/WebDraggableCanvasSurface';
import { Box, Text, Pressable } from '@repo/ui/primitives';
// @ts-ignore — dnd-kit web only
import { DndContext, closestCenter, DragOverlay, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragCancelEvent, type DragEndEvent, type DragOverEvent, type DragStartEvent } from '@dnd-kit/core';
// @ts-ignore
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { FocusRing } from '@repo/ui/components/FocusRing';
import React, { useCallback, useState } from 'react';

export type SelfCanvasViewMode = 'carousel' | 'tiled';
type ZoneId = 'today' | 'private' | 'shared';
const ZONE_LABELS: Record<ZoneId, string> = { today: 'Today', private: 'Private', shared: 'Shared' };
const ZONE_DESCRIPTIONS: Record<ZoneId, string> = {
  today: 'What you use daily — drag to reorder, long-press to pin or hide.',
  private: 'Personal rhythms and reflections.',
  shared: 'Growth visible to your circles.',
};

export interface SelfCanvasProps {
  features: AccessibleFeature[];
  byZone: Record<ZoneId, AccessibleFeature[]>;
  viewMode: SelfCanvasViewMode;
  onViewModeToggle: () => void;
  onReorder: (orderedIds: string[]) => void;
  onToggleHidden: (featureId: string, hidden: boolean) => void;
  onTogglePin: (featureId: string) => void;
  pinnedIds: string[];
  hiddenIds: string[];
  userId?: string;
  onFeaturePress?: (feature: AccessibleFeature) => void;
}

function Card({
  feature,
  isPinned,
  isHidden,
  userId,
  onTogglePin,
  onToggleHidden,
  onFeaturePress,
}: {
  feature: AccessibleFeature;
  isPinned: boolean;
  isHidden: boolean;
  userId?: string;
  onTogglePin: (id: string) => void;
  onToggleHidden: (id: string, hidden: boolean) => void;
  onFeaturePress?: (f: AccessibleFeature) => void;
}) {
  return (
    <Box className="rounded-2xl border border-border bg-phase-surface p-3 mb-3" accessibilityLabel={`${feature.emoji} ${feature.label}`}>
      <Box className="flex-row justify-between items-center mb-2">
        <Box className="flex-row items-center gap-2 flex-1">
          <Text className="text-base">{feature.emoji}</Text>
          <Text className="text-sm font-bold text-ink flex-1" numberOfLines={1}>
            {feature.label}
          </Text>
          {feature.isGeneral ? (
            <Box className="px-2 py-0.5 rounded-full bg-ink/5">
              <Text className="text-[10px] font-bold text-ink/50">GENERAL</Text>
            </Box>
          ) : null}
        </Box>
        <Box className="flex-row gap-1">
          <Pressable
            onPress={() => onTogglePin(feature.id)}
            className={`px-3 py-1.5 rounded-full border ${isPinned ? 'bg-ink border-ink' : 'bg-white border-border'}`}
          >
            <Text className={`text-xs font-bold ${isPinned ? 'text-white' : 'text-ink'}`}>{isPinned ? 'Pinned' : 'Pin'}</Text>
          </Pressable>
          <Pressable onPress={() => onToggleHidden(feature.id, !isHidden)} className="px-3 py-1.5 rounded-full bg-white border border-border">
            <Text className="text-xs font-bold text-ink">{isHidden ? 'Show' : 'Hide'}</Text>
          </Pressable>
        </Box>
      </Box>
      <Box className="rounded-xl bg-phase-canvas/50 p-2">
        <SelfFeatureRenderer componentId={feature.componentId} featureId={feature.id} userId={userId} compact />
      </Box>
      {onFeaturePress ? (
        <Pressable onPress={() => onFeaturePress(feature)} className="mt-2 self-start">
          <Text className="text-xs font-semibold text-phase-interactive">Open →</Text>
        </Pressable>
      ) : null}
    </Box>
  );
}

export function SelfCanvas({ features, byZone, viewMode, onViewModeToggle, onReorder, onToggleHidden, onTogglePin, pinnedIds, hiddenIds, userId, onFeaturePress }: SelfCanvasProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const globalIds = features.map((f) => f.id);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  const announcements = {
    onDragStart({ active }: DragStartEvent) {
      return `Picked up ${active.id as string}`;
    },
    onDragOver({ active, over }: DragOverEvent) {
      if (!over) return `Dragging ${active.id as string}`;
      return `${active.id as string} over ${over.id as string}`;
    },
    onDragEnd({ active, over }: DragEndEvent) {
      if (over) return `Dropped ${active.id as string} over ${over.id as string}`;
      return `Dropped ${active.id as string}`;
    },
    onDragCancel({ active }: DragCancelEvent) {
      return `Cancelled ${active.id as string}`;
    },
  };

  const handleDragStart = useCallback((e: DragStartEvent) => setActiveId(e.active.id as string), []);
  const handleDragEnd = useCallback(
    (e: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = e;
      if (!over || active.id === over.id) return;
      const oldIndex = globalIds.indexOf(active.id as string);
      const newIndex = globalIds.indexOf(over.id as string);
      if (oldIndex === -1 || newIndex === -1) return;
      const next = arrayMove(globalIds, oldIndex, newIndex);
      onReorder(next);
    },
    [globalIds, onReorder],
  );

  const zones: ZoneId[] = ['today', 'private', 'shared'];

  return (
    <Box className="gap-4">
      <Box className="flex-row gap-2">
        <Pressable onPress={onViewModeToggle} className="px-3 py-1.5 rounded-full border bg-white border-border">
          <Text className="text-xs font-bold text-ink">{viewMode === 'tiled' ? 'Tiled' : 'Carousel'} — toggle</Text>
        </Pressable>
      </Box>
      <DndContext sensors={sensors} accessibility={{ announcements }} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={() => setActiveId(null)}>
        <SortableContext items={globalIds} strategy={verticalListSortingStrategy}>
          {zones.map((zoneId) => {
            const zoneFeatures = byZone[zoneId] ?? [];
            if (zoneFeatures.length === 0) return null;
            return (
              <SettingsGroup key={zoneId} title={ZONE_LABELS[zoneId]} subtitle={ZONE_DESCRIPTIONS[zoneId]}>
                {zoneFeatures.map((feature) => (
                  <WebDraggableCanvasSurface key={feature.id} id={feature.id}>
                    <FocusRing>
                      <Box style={{ opacity: activeId === feature.id ? 0.6 : 1 }}>
                        <Card
                          feature={feature}
                          isPinned={pinnedIds.includes(feature.id)}
                          isHidden={hiddenIds.includes(feature.id)}
                          userId={userId}
                          onTogglePin={onTogglePin}
                          onToggleHidden={onToggleHidden}
                          onFeaturePress={onFeaturePress}
                        />
                      </Box>
                    </FocusRing>
                  </WebDraggableCanvasSurface>
                ))}
              </SettingsGroup>
            );
          })}
        </SortableContext>
        <DragOverlay>{activeId ? <Box className="rounded-2xl border border-ink bg-white p-3 shadow-lg"><Text className="text-sm font-bold text-ink">{activeId}</Text></Box> : null}</DragOverlay>
      </DndContext>
    </Box>
  );
}
