import { StyleSheet } from 'react-native';
import { Text, View } from '@repo/ui/primitives';
import { Pressable } from '@repo/ui/primitives';
import { Theme } from '@repo/ui/theme/Theme';
import { CanvasSurfaceCard } from '@repo/ui/components/workspace/CanvasSurfaceCard';
import { WebDraggableCanvasSurface } from '@repo/ui/components/workspace/WebDraggableCanvasSurface';
import type { CanvasZoneColumnProps } from '@repo/ui/components/workspace/CanvasZoneColumn';

export function WebCanvasZoneColumn<
  TSurfaceId extends string = string,
  TCapabilityKey extends string = string,
>({
  group,
  title,
  description,
  renderSurfaceContent,
  getSurfaceTitle,
  getSurfaceSubtitle,
  getSurfaceSummary,
  getSurfaceSnapshot,
  getSurfaceTemporalLabel,
  getSurfaceTemporalTone,
  getSurfaceMetadata,
  renderSurfaceActions,
  onSurfacePress,
  onPressSurfaceInfo,
  onToggleHidden,
  onReorder,
  reorderHint = 'Use the drag handle or move controls to reorder',
  emptyMessage = 'No visible surfaces in this zone yet.',
  style,
}: CanvasZoneColumnProps<TSurfaceId, TCapabilityKey>) {
  const canReorder = Boolean(onReorder);

  return (
    <View style={[styles.column, style]}>
      <View accessibilityRole="header" style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{title ?? group.zone}</Text>
          <View style={styles.countPill}>
            <Text style={styles.countText}>{group.surfaces.length}</Text>
          </View>
        </View>
        <Text style={styles.description}>{description ?? 'Shared workspace zone.'}</Text>
      </View>

      <View style={styles.body}>
        {group.surfaces.length ? (
          group.surfaces.map((surface, index) => (
            <WebDraggableCanvasSurface
              key={surface.surfaceId}
              id={surface.surfaceId}
              disabled={!canReorder}
            >
              <View style={styles.surface}>
                <CanvasSurfaceCard
                  surface={surface}
                  title={getSurfaceTitle?.(surface)}
                  subtitle={getSurfaceSubtitle?.(surface)}
                  summary={getSurfaceSummary?.(surface)}
                  snapshot={getSurfaceSnapshot?.(surface)}
                  temporalLabel={getSurfaceTemporalLabel?.(surface)}
                  temporalTone={getSurfaceTemporalTone?.(surface)}
                  metadata={getSurfaceMetadata?.(surface)}
                  content={renderSurfaceContent?.(surface)}
                  actions={renderSurfaceActions?.(surface)}
                  onPress={onSurfacePress}
                  onPressInfo={onPressSurfaceInfo}
                  onToggleHidden={onToggleHidden}
                  reorderEnabled={canReorder}
                  dragEnabled={false}
                  reorderHint={reorderHint}
                  reorderControls={
                    canReorder
                      ? {
                          canMoveUp: index > 0,
                          canMoveDown: index < group.surfaces.length - 1,
                          onMoveUp: () =>
                            onReorder?.(surface.surfaceId as TSurfaceId, Math.max(0, index - 1)),
                          onMoveDown: () =>
                            onReorder?.(
                              surface.surfaceId as TSurfaceId,
                              Math.min(group.surfaces.length - 1, index + 1),
                            ),
                        }
                      : undefined
                  }
                />
              </View>
            </WebDraggableCanvasSurface>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyLabel}>Zone ready</Text>
            <Text style={styles.emptyText}>{emptyMessage}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  column: {
    minWidth: 360,
    maxWidth: 440,
    flex: 1,
    gap: Theme.spacing.md,
  },
  header: {
    gap: 4,
    paddingHorizontal: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Theme.spacing.sm,
  },
  title: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: '700',
    color: Theme.colors.inkTruth,
  },
  countPill: {
    minWidth: 28,
    alignItems: 'center',
    borderRadius: Theme.corners.full,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: Theme.colors.silk,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  countText: {
    fontSize: Theme.typography.fontSize.xs,
    fontWeight: '700',
    color: Theme.colors.textSecondary,
  },
  description: {
    fontSize: Theme.typography.fontSize.sm,
    lineHeight: 20,
    color: Theme.colors.textSecondary,
  },
  body: {
    gap: Theme.spacing.md,
  },
  surface: {
    gap: Theme.spacing.xs,
  },
  dragRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: Theme.spacing.xs,
  },
  reorderLabel: {
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.textSecondary,
  },
  emptyState: {
    borderRadius: Theme.corners.generous,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Theme.colors.saffronMuted,
    padding: Theme.spacing.lg,
    backgroundColor: 'rgba(250, 247, 237, 0.55)',
    gap: 4,
    minHeight: 180,
    justifyContent: 'center',
  },
  emptyLabel: {
    fontSize: Theme.typography.fontSize.xs,
    fontWeight: '700',
    letterSpacing: 1,
    color: Theme.colors.saffronMuted,
    textTransform: 'uppercase',
  },
  emptyText: {
    fontSize: Theme.typography.fontSize.md,
    lineHeight: 22,
    color: Theme.colors.textSecondary,
  },
});
