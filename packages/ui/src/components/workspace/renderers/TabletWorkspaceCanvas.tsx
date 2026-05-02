import type { WorkspaceRendererConfig } from '@repo/core/logic';
import { StyleSheet } from 'react-native';
import { View } from '../../../primitives';
import { Theme } from '../../../theme/Theme';
import { CanvasZoneColumn } from '../CanvasZoneColumn';
import { useWorkspaceCanvasData, WorkspaceCanvasEmptyState, WorkspaceCanvasHero } from '../shared';
import type { WorkspaceCanvasProps } from '../types';

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
      />
      {visibleCount === 0 ? (
        <WorkspaceCanvasEmptyState emptyMessage={emptyMessage} />
      ) : (
        <View style={styles.grid}>
          {groups.map((group) => (
            <CanvasZoneColumn
              key={group.zone}
              group={group}
              compact={true}
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
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    gap: Theme.spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.lg,
    alignItems: 'flex-start',
  },
  gridItem: {
    width: '48%',
  },
});

export default TabletWorkspaceCanvas;
