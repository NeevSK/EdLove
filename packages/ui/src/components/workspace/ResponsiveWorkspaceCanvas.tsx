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
import { createWorkspaceRendererConfig } from '@repo/core/logic';
import type { WorkspaceRendererConfig, WorkspaceRuntimePlatform } from '@repo/core/types';
import { resolveNativeRendererWidth, responsiveLayout } from '@repo/ui/components/layout';
import { CanvasZoneColumn } from '@repo/ui/components/workspace/CanvasZoneColumn';
import {
  DEPTH_PRESETS,
  useWorkspaceCanvasData,
  WorkspaceCanvasEmptyState,
  WorkspaceCanvasHero,
} from '@repo/ui/components/workspace/shared';
import type { WorkspaceCanvasProps } from '@repo/ui/components/workspace/types';
import { useResponsive } from '@repo/ui/hooks/useResponsive';
import { useThemedColors } from '@repo/ui/hooks/useThemedColors';
import { ScrollView, View } from '@repo/ui/primitives';
import { Theme } from '@repo/ui/theme/Theme';
import React from 'react';
import { Platform, StyleSheet } from 'react-native';

export interface ExtendedWorkspaceCanvasProps<
  TSurfaceId extends string = string,
  TCapabilityKey extends string = string,
> extends WorkspaceCanvasProps<TSurfaceId, TCapabilityKey> {
  renderer?: WorkspaceRendererConfig;
}

export function ResponsiveWorkspaceCanvas<
  TSurfaceId extends string = string,
  TCapabilityKey extends string = string,
>({
  title = 'Workspace Canvas',
  subtitle = 'Shared zone-first canvas renderer for capability surfaces.',
  emptyMessage = 'No surfaces are available for this workspace yet.',
  depthPreset = 'sanctuary-calm',
  renderer: explicitRenderer,
  ...props
}: ExtendedWorkspaceCanvasProps<TSurfaceId, TCapabilityKey>) {
  const { width, height } = useResponsive();
  const colors = useThemedColors();
  const preset = DEPTH_PRESETS[depthPreset] ?? DEPTH_PRESETS['sanctuary-calm'];

  const runtimePlatform: WorkspaceRuntimePlatform =
    Platform.OS === 'web' ? 'web' : Platform.OS === 'ios' ? 'ios' : 'android';

  const renderer =
    explicitRenderer ??
    createWorkspaceRendererConfig({
      runtimePlatform,
      width: runtimePlatform === 'web' ? width : resolveNativeRendererWidth(width, height),
    });

  const { groups, visibleCount, pinnedCount } = useWorkspaceCanvasData<TSurfaceId, TCapabilityKey>(
    props,
  );

  // Web DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleWebDragEnd = React.useCallback(
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

  // Dynamic Dotted Ground Background styling
  const isWeb = Platform.OS === 'web';
  const groundStyle =
    isWeb && preset.showDots
      ? {
          backgroundImage: `radial-gradient(${preset.dotColor} 0.75px, transparent 0.75px)`,
          backgroundSize: `${preset.dotSpacing}px ${preset.dotSpacing}px`,
          backgroundColor: colors.primary,
        }
      : {
          backgroundColor: colors.primary,
        };

  return (
    <View style={[styles.ground, groundStyle as any]}>
      <View style={styles.container}>
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
        ) : renderer.platform === 'mobile' ? (
          /* Mobile Single Column Vertical Stream */
          <View style={styles.mobileStack}>
            {groups.map((group) => (
              <CanvasZoneColumn
                key={group.zone}
                group={group}
                compact={true}
                depthPreset={depthPreset}
                spatialArrangement={props.spatialArrangement ?? 'stream'}
                style={styles.mobileStackItem}
                renderSurfaceContent={props.renderSurfaceContent}
                getSurfaceTitle={props.getSurfaceTitle}
                getSurfaceSubtitle={props.getSurfaceSubtitle}
                getSurfaceSummary={props.getSurfaceSummary}
                getSurfaceSnapshot={props.getSurfaceSnapshot}
                getSurfaceTemporalLabel={props.getSurfaceTemporalLabel}
                getSurfaceTemporalTone={props.getSurfaceTemporalTone}
                getSurfaceEmoji={props.getSurfaceEmoji}
                getSurfaceCategory={props.getSurfaceCategory}
                getSurfaceEnergyVibe={props.getSurfaceEnergyVibe}
                getSurfaceMetadata={props.getSurfaceMetadata}
                renderSurfaceActions={props.renderSurfaceActions}
                onSurfacePress={props.onSurfacePress}
                onPressSurfaceInfo={props.onPressSurfaceInfo}
                onToggleHidden={props.onToggleHidden}
                onTogglePin={props.onTogglePin}
                onReorder={props.onReorder}
                dragEnabled={Boolean(props.onReorder)}
                dragAxis="vertical"
                reorderHint="Hold and drag up or down to reorder"
              />
            ))}
          </View>
        ) : renderer.platform === 'tablet' ? (
          /* Tablet 2-Column Responsive Flow */
          <View style={styles.tabletGrid}>
            {groups.map((group) => (
              <CanvasZoneColumn
                key={group.zone}
                group={group}
                compact={false}
                depthPreset={depthPreset}
                spatialArrangement={props.spatialArrangement ?? 'stream'}
                style={styles.tabletGridItem}
                renderSurfaceContent={props.renderSurfaceContent}
                getSurfaceTitle={props.getSurfaceTitle}
                getSurfaceSubtitle={props.getSurfaceSubtitle}
                getSurfaceSummary={props.getSurfaceSummary}
                getSurfaceSnapshot={props.getSurfaceSnapshot}
                getSurfaceTemporalLabel={props.getSurfaceTemporalLabel}
                getSurfaceTemporalTone={props.getSurfaceTemporalTone}
                getSurfaceEmoji={props.getSurfaceEmoji}
                getSurfaceCategory={props.getSurfaceCategory}
                getSurfaceEnergyVibe={props.getSurfaceEnergyVibe}
                getSurfaceMetadata={props.getSurfaceMetadata}
                renderSurfaceActions={props.renderSurfaceActions}
                onSurfacePress={props.onSurfacePress}
                onPressSurfaceInfo={props.onPressSurfaceInfo}
                onToggleHidden={props.onToggleHidden}
                onTogglePin={props.onTogglePin}
                onReorder={props.onReorder}
                dragEnabled={Boolean(props.onReorder)}
                reorderHint="Drag up or down to reorder"
              />
            ))}
          </View>
        ) : (
          /* Web / Desktop Multi-Column Zone Deck with DnD-Kit */
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleWebDragEnd}
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.webColumns}
            >
              {groups.map((group) => (
                <SortableContext
                  key={group.zone}
                  items={group.surfaces.map((surface) => surface.surfaceId)}
                  strategy={verticalListSortingStrategy}
                >
                  <CanvasZoneColumn
                    group={group}
                    depthPreset={depthPreset}
                    spatialArrangement={props.spatialArrangement ?? 'stream'}
                    renderSurfaceContent={props.renderSurfaceContent}
                    getSurfaceTitle={props.getSurfaceTitle}
                    getSurfaceSubtitle={props.getSurfaceSubtitle}
                    getSurfaceSummary={props.getSurfaceSummary}
                    getSurfaceSnapshot={props.getSurfaceSnapshot}
                    getSurfaceTemporalLabel={props.getSurfaceTemporalLabel}
                    getSurfaceTemporalTone={props.getSurfaceTemporalTone}
                    getSurfaceEmoji={props.getSurfaceEmoji}
                    getSurfaceCategory={props.getSurfaceCategory}
                    getSurfaceEnergyVibe={props.getSurfaceEnergyVibe}
                    getSurfaceMetadata={props.getSurfaceMetadata}
                    renderSurfaceActions={props.renderSurfaceActions}
                    onSurfacePress={props.onSurfacePress}
                    onPressSurfaceInfo={props.onPressSurfaceInfo}
                    onToggleHidden={props.onToggleHidden}
                    onTogglePin={props.onTogglePin}
                    onReorder={props.onReorder}
                    webDragEnabled={true}
                    reorderHint="Drag to reorder — or use move controls"
                    style={styles.webColumnItem}
                  />
                </SortableContext>
              ))}
            </ScrollView>
          </DndContext>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ground: {
    flex: 1,
    width: '100%',
  },
  container: {
    width: '100%',
    gap: Theme.spacing.lg,
  },
  mobileStack: {
    width: '100%',
    gap: Theme.spacing.lg,
  },
  mobileStackItem: {
    width: '100%',
    minWidth: 0,
  },
  tabletGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.lg,
    alignItems: 'flex-start',
  },
  tabletGridItem: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minWidth: responsiveLayout.tabletColumnMinWidth,
  },
  webColumns: {
    gap: Theme.spacing.lg,
    paddingBottom: Theme.spacing.sm,
  },
  webColumnItem: {
    minWidth: 360,
    maxWidth: 440,
  },
});

export { ResponsiveWorkspaceCanvas as WorkspaceCanvas };
export default ResponsiveWorkspaceCanvas;
