import type { WorkspaceRendererConfig } from '@repo/core/types';
import { StyleSheet } from 'react-native';
import { ScrollView, View } from '@repo/ui/primitives';
import { Theme } from '@repo/ui/theme/Theme';
import { CanvasZoneColumn } from '@repo/ui/components/workspace/CanvasZoneColumn';
import { useWorkspaceCanvasData, WorkspaceCanvasEmptyState, WorkspaceCanvasHero } from '@repo/ui/components/workspace/shared';
import type { WorkspaceCanvasProps } from '@repo/ui/components/workspace/types';
import React from 'react';

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
  const zoneRectsRef = React.useRef<Record<string, { y: number; h: number }>>({});
  const onMeasureZone = React.useCallback((zone: string, y: number, h: number) => {
    zoneRectsRef.current[zone] = { y, h };
  }, []);

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
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.columns}>
          {groups.map((group) => (
            <CanvasZoneColumn
              key={group.zone}
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
              dragEnabled={Boolean(props.onReorder)}
              reorderHint="Drag to reorder — or use move controls"
              style={styles.webColumn}
              onMeasureZone={onMeasureZone as never}
            />
          ))}
        </ScrollView>
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
