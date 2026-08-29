import type { WorkspaceRendererConfig } from '@repo/core/types';
import { responsiveLayout } from '@repo/ui/components/layout';
import { CanvasZoneColumn } from '@repo/ui/components/workspace/CanvasZoneColumn';
import {
  useWorkspaceCanvasData,
  WorkspaceCanvasEmptyState,
  WorkspaceCanvasHero,
} from '@repo/ui/components/workspace/shared';
import type { WorkspaceCanvasProps } from '@repo/ui/components/workspace/types';
import { View } from '@repo/ui/primitives';
import { Theme } from '@repo/ui/theme/Theme';
import { StyleSheet } from 'react-native';

export interface TabletWorkspaceCanvasProps<
  TSurfaceId extends string = string,
  TCapabilityKey extends string = string,
> extends WorkspaceCanvasProps<TSurfaceId, TCapabilityKey> {
  renderer: WorkspaceRendererConfig;
}

export function TabletWorkspaceCanvas<
  TSurfaceId extends string = string,
  TCapabilityKey extends string = string,
>({
  title = 'Workspace Canvas',
  subtitle = 'Shared zone-first canvas renderer for capability surfaces.',
  emptyMessage = 'No surfaces are available for this workspace yet.',
  renderer,
  ...props
}: TabletWorkspaceCanvasProps<TSurfaceId, TCapabilityKey>) {
  const { groups, visibleCount, pinnedCount } = useWorkspaceCanvasData(props);

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
        <View style={styles.grid}>
          {groups.map((group) => (
            <CanvasZoneColumn
              key={group.zone}
              group={group}
              compact={false}
              style={styles.gridItem}
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
              reorderHint="Drag up or down to reorder"
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    width: '100%',
    minWidth: 0,
    alignSelf: 'stretch',
    gap: Theme.spacing.lg,
  },
  grid: {
    width: '100%',
    minWidth: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.lg,
    alignItems: 'flex-start',
  },
  gridItem: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minWidth: responsiveLayout.tabletColumnMinWidth,
  },
});

export default TabletWorkspaceCanvas;
