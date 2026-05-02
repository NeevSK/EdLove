import type { WorkspaceRendererConfig } from '@repo/core/logic';
import { StyleSheet } from 'react-native';
import { ScrollView, View } from '../../../primitives';
import { Theme } from '../../../theme/Theme';
import { CanvasZoneColumn } from '../CanvasZoneColumn';
import { useWorkspaceCanvasData, WorkspaceCanvasEmptyState, WorkspaceCanvasHero } from '../shared';
import type { WorkspaceCanvasProps } from '../types';

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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.columns}
        >
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
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    gap: Theme.spacing.lg,
  },
  columns: {
    gap: Theme.spacing.lg,
    paddingBottom: Theme.spacing.sm,
  },
});

export default WebWorkspaceCanvas;
