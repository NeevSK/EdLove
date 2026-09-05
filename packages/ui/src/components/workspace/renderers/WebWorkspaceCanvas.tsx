import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { WorkspaceRendererConfig } from '@repo/core/types';
import {
  useWorkspaceCanvasData,
  WorkspaceCanvasEmptyState,
  WorkspaceCanvasHero,
} from '@repo/ui/components/workspace/shared';
import type { WorkspaceCanvasProps } from '@repo/ui/components/workspace/types';
import { WebCanvasZoneColumn } from '@repo/ui/components/workspace/WebCanvasZoneColumn';
import { ScrollView, View } from '@repo/ui/primitives';
import { Theme } from '@repo/ui/theme/Theme';
import React from 'react';
import { StyleSheet } from 'react-native';

export interface WebWorkspaceCanvasProps<
  TSurfaceId extends string = string,
  TCapabilityKey extends string = string,
> extends WorkspaceCanvasProps<TSurfaceId, TCapabilityKey> {
  renderer: WorkspaceRendererConfig;
}

export function WebWorkspaceCanvas<
  TSurfaceId extends string = string,
  TCapabilityKey extends string = string,
>({
  title = 'Workspace Canvas',
  subtitle = 'Shared zone-first canvas renderer for capability surfaces.',
  emptyMessage = 'No surfaces are available for this workspace yet.',
  renderer,
  ...props
}: WebWorkspaceCanvasProps<TSurfaceId, TCapabilityKey>) {
  const { groups, visibleCount, pinnedCount } = useWorkspaceCanvasData(props);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const handleDragEnd = React.useCallback(
    ({ active, over }: DragEndEvent) => {
      if (!over || active.id === over.id || !props.onReorder) return;
      const activeId = String(active.id);
      const overId = String(over.id);
      const group = groups.find(
        (candidate) =>
          candidate.surfaces.some((surface) => String(surface.surfaceId) === activeId) &&
          candidate.surfaces.some((surface) => String(surface.surfaceId) === overId),
      );
      if (!group) return;
      const oldIndex = group.surfaces.findIndex(
        (surface) => String(surface.surfaceId) === activeId,
      );
      const newIndex = group.surfaces.findIndex((surface) => String(surface.surfaceId) === overId);
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;
      props.onReorder(activeId as TSurfaceId, newIndex);
    },
    [groups, props.onReorder],
  );

  return (
    <View style={styles.shell}>
      <WorkspaceCanvasHero
        title={title}
        subtitle={subtitle}
        visibleCount={visibleCount}
        pinnedCount={pinnedCount}
        renderer={renderer}
        workspaceId={props.workspaceId}
      />
      {visibleCount === 0 ? (
        <WorkspaceCanvasEmptyState emptyMessage={emptyMessage} />
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.columns}
          >
            {groups.map((group) => (
              <SortableContext
                key={group.zone}
                items={group.surfaces.map((surface) => surface.surfaceId)}
                strategy={verticalListSortingStrategy}
              >
                <WebCanvasZoneColumn
                  group={group}
                  renderSurfaceContent={props.renderSurfaceContent}
                  getSurfaceTitle={props.getSurfaceTitle}
                  getSurfaceSubtitle={props.getSurfaceSubtitle}
                  getSurfaceSummary={props.getSurfaceSummary}
                  getSurfaceSnapshot={props.getSurfaceSnapshot}
                  getSurfaceTemporalLabel={props.getSurfaceTemporalLabel}
                  getSurfaceTemporalTone={props.getSurfaceTemporalTone}
                  getSurfaceMetadata={props.getSurfaceMetadata}
                  renderSurfaceActions={props.renderSurfaceActions}
                  onSurfacePress={props.onSurfacePress}
                  onPressSurfaceInfo={props.onPressSurfaceInfo}
                  onToggleHidden={props.onToggleHidden}
                  onReorder={props.onReorder}
                  reorderHint="Drag to reorder — or use move controls"
                  style={styles.webColumn}
                />
              </SortableContext>
            ))}
          </ScrollView>
        </DndContext>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { gap: Theme.spacing.lg },
  columns: { gap: Theme.spacing.lg, paddingBottom: Theme.spacing.sm },
  webColumn: { minWidth: 360, maxWidth: 440 },
});

export default WebWorkspaceCanvas;
