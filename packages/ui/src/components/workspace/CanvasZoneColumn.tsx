import type { WorkspaceZoneLayoutGroup } from '@repo/core/logic/workspace/canvas';
import type { ResolvedWorkspaceSurface } from '@repo/core/types';
import React from 'react';
import { Platform } from 'react-native';
import { type StyleProp, StyleSheet, type ViewStyle } from 'react-native';
import { Text } from '@repo/ui/primitives';
import { useThemedColors } from '@repo/ui/hooks/useThemedColors';
import { View } from '@repo/ui/primitives';
import { Theme } from '@repo/ui/theme/Theme';
import { CanvasSurfaceCard } from '@repo/ui/components/workspace/CanvasSurfaceCard';
import { DraggableCanvasSurface } from '@repo/ui/components/workspace/DraggableCanvasSurface';
import { clampReorderIndex, resolveReorderTarget } from '@repo/ui/components/workspace/reorder';

export { clampReorderIndex, resolveReorderTarget } from '@repo/ui/components/workspace/reorder';

export interface CanvasZoneColumnProps<
  TSurfaceId extends string = string,
  TCapabilityKey extends string = string,
> {
  group: WorkspaceZoneLayoutGroup<TSurfaceId, TCapabilityKey>;
  title?: string;
  description?: string;
  renderSurfaceContent?: (
    surface: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>,
  ) => React.ReactNode;
  getSurfaceTitle?: (surface: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>) => string;
  getSurfaceSubtitle?: (
    surface: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>,
  ) => string | undefined;
  getSurfaceSummary?: (
    surface: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>,
  ) => string | undefined;
  getSurfaceSnapshot?: (
    surface: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>,
  ) => string | undefined;
  getSurfaceTemporalLabel?: (
    surface: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>,
  ) => string | undefined;
  getSurfaceTemporalTone?: (
    surface: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>,
  ) => 'present' | 'past' | 'future' | 'neutral' | undefined;
  getSurfaceMetadata?: (
    surface: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>,
  ) => string[] | undefined;
  renderSurfaceActions?: (
    surface: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>,
  ) => React.ReactNode;
  onSurfacePress?: (surface: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>) => void;
  onPressSurfaceInfo?: (surface: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>) => void;
  onToggleHidden?: (surface: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>) => void;
  onReorder?: (surfaceId: TSurfaceId, newIndex: number) => void;
  dragAxis?: 'vertical' | 'both';
  dragEnabled?: boolean;
  reorderHint?: string;
  emptyMessage?: string;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
  onMeasureZone?: (zone: string, y: number, h: number) => void;
}

const ZONE_TITLES: Record<string, string> = {
  today: 'Today Window',
  work: 'Work Bench',
  institution: 'Institution Arc',
  outlook: 'Outlook Deck',
  private: 'Private Studio',
};

const ZONE_DESCRIPTIONS: Record<string, string> = {
  today: 'Immediate focus and fast-moving signals.',
  work: 'Hands-on tasks and package-owned daily work.',
  institution: 'School-wide leadership and governance surfaces.',
  outlook: 'Forecasts, planning horizons, and watchpoints.',
  private: 'Personal reflections and user-specific overlays.',
};

export function CanvasZoneColumn<
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
  dragAxis = 'both',
  dragEnabled = Boolean(onReorder),
  reorderHint,
  emptyMessage = 'No visible surfaces in this zone yet.',
  compact = false,
  style,
  onMeasureZone,
}: CanvasZoneColumnProps<TSurfaceId, TCapabilityKey>) {
  const colors = useThemedColors();
  const styles = createStyles(colors);
  const canReorder = Boolean(onReorder);
  const cardHeightsRef = React.useRef<Record<string, number>>({});

  return (
    <View
      style={[styles.column, compact ? styles.columnCompact : null, style]}
      onLayout={(e) => {
        if (onMeasureZone) {
          const { y, height } = e.nativeEvent.layout;
          onMeasureZone(group.zone, y, height);
        }
      }}
    >
      <View accessibilityRole="header" style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{title ?? ZONE_TITLES[group.zone] ?? group.zone}</Text>
          <View style={styles.countPill}>
            <Text style={styles.countText}>{group.surfaces.length}</Text>
          </View>
        </View>
        <Text style={styles.description}>
          {description ?? ZONE_DESCRIPTIONS[group.zone] ?? 'Shared workspace zone.'}
        </Text>
      </View>
      <View style={styles.body}>
        {group.surfaces.length ? (
          group.surfaces.map((surface) => (
            <DraggableCanvasSurface
              key={surface.surfaceId}
              id={surface.surfaceId}
              dragAxis={dragAxis}
              enabled={canReorder && dragEnabled}
              onDragEnd={(id, translation) => {
                const measured = cardHeightsRef.current[id as string] ?? 180;
                const shift = Math.round(translation.y / measured);
                if (shift !== 0 && onReorder) {
                  const currentIndex = group.surfaces.findIndex((s) => s.surfaceId === id);
                  const nextIndex = clampReorderIndex(currentIndex, shift, group.surfaces.length);
                  if (nextIndex !== currentIndex) onReorder(id as TSurfaceId, nextIndex);
                }
              }}
            >
              <View
                onLayout={(e) => {
                  cardHeightsRef.current[surface.surfaceId as string] = e.nativeEvent.layout.height;
                }}
              >
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
                  dragEnabled={dragEnabled}
                  reorderHint={reorderHint}
                  reorderControls={
                    canReorder
                      ? {
                          canMoveUp:
                            group.surfaces.findIndex(
                              (item) => item.surfaceId === surface.surfaceId,
                            ) > 0,
                          canMoveDown:
                            group.surfaces.findIndex(
                              (item) => item.surfaceId === surface.surfaceId,
                            ) <
                            group.surfaces.length - 1,
                          onMoveUp: () => {
                            const currentIndex = group.surfaces.findIndex(
                              (item) => item.surfaceId === surface.surfaceId,
                            );
                            onReorder?.(
                              surface.surfaceId as TSurfaceId,
                              resolveReorderTarget(currentIndex, -1, group.surfaces.length),
                            );
                          },
                          onMoveDown: () => {
                            const currentIndex = group.surfaces.findIndex(
                              (item) => item.surfaceId === surface.surfaceId,
                            );
                            onReorder?.(
                              surface.surfaceId as TSurfaceId,
                              resolveReorderTarget(currentIndex, 1, group.surfaces.length),
                            );
                          },
                        }
                      : undefined
                  }
                />
              </View>
            </DraggableCanvasSurface>
          ))
        ) : (
          <View style={[styles.emptyState, compact ? styles.emptyStateCompact : null]}>
            <Text style={styles.emptyLabel}>Zone ready</Text>
            <Text style={styles.emptyText}>{emptyMessage}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

function createStyles(colors: ReturnType<typeof useThemedColors>) {
  return StyleSheet.create({
    column: {
      minWidth: 320,
      flex: 1,
      gap: Theme.spacing.md,
    },
    columnCompact: {
      minWidth: 0,
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
      color: colors.text,
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
      color: colors.textSecondary,
    },
    description: {
      fontSize: Theme.typography.fontSize.sm,
      lineHeight: 20,
      color: colors.textSecondary,
    },
    body: {
      gap: Theme.spacing.md,
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
    emptyStateCompact: {
      minHeight: 120,
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
      color: colors.textSecondary,
    },
  });
}

export default CanvasZoneColumn;
