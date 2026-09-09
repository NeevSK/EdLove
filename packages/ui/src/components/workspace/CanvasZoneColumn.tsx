import type { WorkspaceZoneLayoutGroup } from '@repo/core/logic/workspace/canvas';
import type { ResolvedWorkspaceSurface } from '@repo/core/types';
import { CanvasSurfaceCard } from '@repo/ui/components/workspace/CanvasSurfaceCard';
import { DraggableCanvasSurface } from '@repo/ui/components/workspace/DraggableCanvasSurface';
import {
  clampReorderIndex,
  DEPTH_PRESETS,
  resolveReorderTarget,
} from '@repo/ui/components/workspace/shared';
import type {
  CanvasDepthPresetId,
  SpatialArrangement,
  SurfaceCardLayoutMode,
} from '@repo/ui/components/workspace/types';
import { WebDraggableCanvasSurface } from '@repo/ui/components/workspace/WebDraggableCanvasSurface';
import { useThemedColors } from '@repo/ui/hooks/useThemedColors';
import { ScrollView, Text, View } from '@repo/ui/primitives';
import { Theme } from '@repo/ui/theme/Theme';
import React from 'react';
import { Platform, type StyleProp, StyleSheet, type ViewStyle } from 'react-native';

export { clampReorderIndex, resolveReorderTarget } from '@repo/ui/components/workspace/shared';

export interface CanvasZoneColumnProps<
  TSurfaceId extends string = string,
  TCapabilityKey extends string = string,
> {
  group: WorkspaceZoneLayoutGroup<TSurfaceId, TCapabilityKey>;
  title?: string;
  description?: string;
  depthPreset?: CanvasDepthPresetId;
  spatialArrangement?: SpatialArrangement;
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
  getSurfaceEmoji?: (
    surface: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>,
  ) => string | undefined;
  getSurfaceCategory?: (
    surface: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>,
  ) => string | undefined;
  getSurfaceEnergyVibe?: (
    surface: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>,
  ) => [string, string] | undefined;
  getSurfaceMetadata?: (
    surface: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>,
  ) => string[] | undefined;
  renderSurfaceActions?: (
    surface: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>,
  ) => React.ReactNode;
  onSurfacePress?: (surface: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>) => void;
  onPressSurfaceInfo?: (surface: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>) => void;
  onToggleHidden?: (surface: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>) => void;
  onTogglePin?: (surface: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>) => void;
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
  shared: 'Shared Growth',
};

export function CanvasZoneColumn<
  TSurfaceId extends string = string,
  TCapabilityKey extends string = string,
>({
  group,
  title,
  description,
  depthPreset = 'sanctuary-calm',
  spatialArrangement = 'stream',
  renderSurfaceContent,
  getSurfaceTitle,
  getSurfaceSubtitle,
  getSurfaceSummary,
  getSurfaceSnapshot,
  getSurfaceTemporalLabel,
  getSurfaceTemporalTone,
  getSurfaceEmoji,
  getSurfaceCategory,
  getSurfaceEnergyVibe,
  getSurfaceMetadata,
  renderSurfaceActions,
  onSurfacePress,
  onPressSurfaceInfo,
  onToggleHidden,
  onTogglePin,
  onReorder,
  dragAxis = 'both',
  dragEnabled = Boolean(onReorder),
  reorderHint = 'Hold and drag to reorder',
  emptyMessage = 'No visible surfaces in this zone yet.',
  compact = false,
  style,
  onMeasureZone,
}: CanvasZoneColumnProps<TSurfaceId, TCapabilityKey>) {
  const colors = useThemedColors();
  const styles = createStyles(colors);
  const canReorder = Boolean(onReorder);
  const cardHeightsRef = React.useRef<Record<string, number>>({});
  const isWeb = Platform.OS === 'web';

  const layoutMode: SurfaceCardLayoutMode =
    spatialArrangement === 'catalog-grid'
      ? 'tile'
      : spatialArrangement === 'carousel'
        ? 'hero'
        : 'card';

  const renderCard = (
    surface: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>,
    index: number,
  ) => (
    <CanvasSurfaceCard
      surface={surface}
      title={getSurfaceTitle?.(surface)}
      subtitle={getSurfaceSubtitle?.(surface)}
      summary={getSurfaceSummary?.(surface)}
      snapshot={getSurfaceSnapshot?.(surface)}
      temporalLabel={getSurfaceTemporalLabel?.(surface)}
      temporalTone={getSurfaceTemporalTone?.(surface)}
      depthPreset={depthPreset}
      layoutMode={layoutMode}
      emoji={getSurfaceEmoji?.(surface)}
      category={getSurfaceCategory?.(surface)}
      energyVibe={getSurfaceEnergyVibe?.(surface)}
      metadata={getSurfaceMetadata?.(surface)}
      content={renderSurfaceContent?.(surface)}
      actions={renderSurfaceActions?.(surface)}
      onPress={onSurfacePress}
      onPressInfo={onPressSurfaceInfo}
      onToggleHidden={onToggleHidden}
      onTogglePin={onTogglePin}
      reorderEnabled={canReorder && spatialArrangement === 'stream'}
      dragEnabled={dragEnabled && !isWeb && spatialArrangement === 'stream'}
      reorderHint={reorderHint}
      reorderControls={
        canReorder && spatialArrangement === 'stream'
          ? {
              canMoveUp: index > 0,
              canMoveDown: index < group.surfaces.length - 1,
              onMoveUp: () => {
                onReorder?.(
                  surface.surfaceId as TSurfaceId,
                  resolveReorderTarget(index, -1, group.surfaces.length),
                );
              },
              onMoveDown: () => {
                onReorder?.(
                  surface.surfaceId as TSurfaceId,
                  resolveReorderTarget(index, 1, group.surfaces.length),
                );
              },
            }
          : undefined
      }
    />
  );

  const renderContentItems = () => {
    if (!group.surfaces.length) {
      return (
        <View style={[styles.emptyState, compact ? styles.emptyStateCompact : null]}>
          <Text style={styles.emptyText}>{emptyMessage}</Text>
        </View>
      );
    }

    if (spatialArrangement === 'carousel') {
      return (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={296}
          decelerationRate="fast"
          contentContainerStyle={styles.carouselContainer}
        >
          {group.surfaces.map((surface, index) => (
            <View key={surface.surfaceId} style={styles.carouselItem}>
              {renderCard(surface, index)}
            </View>
          ))}
        </ScrollView>
      );
    }

    if (spatialArrangement === 'catalog-grid') {
      return (
        <View style={styles.gridContainer}>
          {group.surfaces.map((surface, index) => (
            <View key={surface.surfaceId} style={styles.gridItem}>
              {renderCard(surface, index)}
            </View>
          ))}
        </View>
      );
    }

    // Default: 'stream' (Vertical stacked flow with drag reordering)
    return (
      <View style={styles.streamContainer}>
        {group.surfaces.map((surface, index) => {
          if (isWeb) {
            return (
              <WebDraggableCanvasSurface
                key={surface.surfaceId}
                id={surface.surfaceId}
                disabled={!canReorder || !dragEnabled}
              >
                <View style={styles.webSurfaceItem}>{renderCard(surface, index)}</View>
              </WebDraggableCanvasSurface>
            );
          }

          return (
            <DraggableCanvasSurface
              key={surface.surfaceId}
              id={surface.surfaceId}
              dragAxis={dragAxis}
              enabled={canReorder && dragEnabled}
              onDragEnd={(id, translation) => {
                const measured = cardHeightsRef.current[id as string];
                if (!measured) return;
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
                {renderCard(surface, index)}
              </View>
            </DraggableCanvasSurface>
          );
        })}
      </View>
    );
  };

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
      </View>
      {renderContentItems()}
    </View>
  );
}

function createStyles(colors: ReturnType<typeof useThemedColors>) {
  return StyleSheet.create({
    column: {
      minWidth: 320,
      flex: 1,
      gap: Theme.spacing.sm,
    },
    columnCompact: {
      minWidth: 0,
    },
    header: {
      paddingHorizontal: 4,
      paddingVertical: 2,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: Theme.spacing.sm,
    },
    title: {
      fontSize: Theme.typography.fontSize.sm,
      fontWeight: '700',
      letterSpacing: 0.5,
      color: colors.textSecondary,
      textTransform: 'uppercase',
    },
    countPill: {
      minWidth: 20,
      height: 20,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: Theme.corners.full,
      paddingHorizontal: 6,
      backgroundColor: Theme.colors.silk,
      borderWidth: 1,
      borderColor: Theme.colors.border,
    },
    countText: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.textSecondary,
    },
    streamContainer: {
      gap: Theme.spacing.sm,
    },
    gridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Theme.spacing.sm,
    },
    gridItem: {
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: '47%',
      minWidth: 140,
    },
    carouselContainer: {
      gap: Theme.spacing.sm,
      paddingVertical: 4,
    },
    carouselItem: {
      width: 280,
    },
    webSurfaceItem: {
      gap: Theme.spacing.xs,
    },
    emptyState: {
      borderRadius: Theme.corners.comfortable,
      borderWidth: 1.25,
      borderColor: Theme.colors.border,
      backgroundColor: colors.card,
      padding: Theme.spacing.md,
      minHeight: 100,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyStateCompact: {
      minHeight: 80,
    },
    emptyText: {
      fontSize: Theme.typography.fontSize.xs,
      color: colors.textSecondary,
    },
  });
}

export { CanvasZoneColumn as WebCanvasZoneColumn };
export default CanvasZoneColumn;
