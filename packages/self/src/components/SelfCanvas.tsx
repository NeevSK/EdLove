import type {
  ResolvedWorkspaceSurface,
  WorkspaceLayout,
  WorkspaceOwnerPackage,
  WorkspaceSurfaceDefinition,
  WorkspaceZoneId,
} from '@repo/core/types';
import { SelfFeatureRenderer } from '@repo/self/components/SelfFeatureRenderer';
import type { AccessibleFeature } from '@repo/self/features/accessPolicy';
import type { SelfCanvasViewMode } from '@repo/self/features/userPreferences';
import SanctuaryModal from '@repo/ui/components/SanctuaryModal';
import type { SpatialArrangement } from '@repo/ui/components/workspace';
import { WorkspaceCanvas } from '@repo/ui/components/workspace';
import { Box, Pressable, Text, View } from '@repo/ui/primitives';
import { Theme } from '@repo/ui/theme/Theme';
import { hapticLight } from '@repo/ui/utils/haptics';
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';

export type { SelfCanvasViewMode } from '@repo/self/features/userPreferences';

type ZoneId = 'today' | 'private' | 'shared';

export interface SelfCanvasProps {
  features: AccessibleFeature[];
  byZone: Record<ZoneId, AccessibleFeature[]>;
  viewMode: SelfCanvasViewMode;
  onViewModeToggle: () => void;
  onSetViewMode?: (mode: SelfCanvasViewMode) => void;
  onReorder: (orderedIds: string[]) => void;
  onToggleHidden: (featureId: string, hidden: boolean) => void;
  onTogglePin: (featureId: string) => void;
  pinnedIds: string[];
  hiddenIds: string[];
  userId?: string;
  onFeaturePress?: (feature: AccessibleFeature) => void;
}

export function SelfCanvas({
  features,
  byZone,
  viewMode,
  onViewModeToggle,
  onSetViewMode,
  onReorder,
  onToggleHidden,
  onTogglePin,
  pinnedIds,
  hiddenIds,
  userId,
  onFeaturePress,
}: SelfCanvasProps) {
  const [activeModalFeature, setActiveModalFeature] = useState<AccessibleFeature | null>(null);

  // Map Self features into canonical WorkspaceSurfaceDefinitions
  const surfaceDefinitions = React.useMemo<WorkspaceSurfaceDefinition[]>(() => {
    return features.map((feature, index) => {
      const defaultZone: WorkspaceZoneId =
        feature.defaultZone === 'shared'
          ? 'work'
          : ((feature.defaultZone as WorkspaceZoneId) ?? 'today');
      return {
        surfaceId: feature.id,
        workspaceId: 'self',
        title: feature.label,
        ownerPackage: 'core' as WorkspaceOwnerPackage,
        capabilityKey: feature.requiredCapabilities[0] ?? 'read:SelfJourney',
        defaultZone,
        defaultOrder: index * 10,
      };
    });
  }, [features]);

  const workspaceLayout = React.useMemo<WorkspaceLayout>(() => {
    const zoneBySurface: Partial<Record<string, WorkspaceZoneId>> = {};
    for (const f of features) {
      zoneBySurface[f.id] =
        f.defaultZone === 'shared' ? 'work' : ((f.defaultZone as WorkspaceZoneId) ?? 'today');
    }

    return {
      workspaceId: 'self',
      userId: userId ?? 'guest',
      order: features.map((f) => f.id),
      hidden: hiddenIds,
      pinned: pinnedIds,
      zoneBySurface,
      updatedAt: new Date().toISOString(),
    };
  }, [features, hiddenIds, pinnedIds, userId]);

  const spatialMode: SpatialArrangement =
    viewMode === 'carousel' ? 'carousel' : viewMode === 'stream' ? 'stream' : 'catalog-grid';

  const featureMap = React.useMemo(() => {
    const map = new Map<string, AccessibleFeature>();
    for (const f of features) map.set(f.id, f);
    return map;
  }, [features]);

  return (
    <View style={styles.container}>
      {/* Executive Spatial Switcher */}
      <View style={styles.modeBar}>
        <View style={styles.modePillGroup}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Switch to Catalog Grid"
            onPress={() => {
              hapticLight();
              onSetViewMode ? onSetViewMode('catalog-grid') : onViewModeToggle();
            }}
            style={[
              styles.modePill,
              viewMode === 'catalog-grid' || viewMode === 'tiled' ? styles.modePillActive : null,
            ]}
          >
            <Text
              style={[
                styles.modePillText,
                viewMode === 'catalog-grid' || viewMode === 'tiled'
                  ? styles.modePillTextActive
                  : null,
              ]}
            >
              Catalog Grid
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Switch to Hero Carousel"
            onPress={() => {
              hapticLight();
              onSetViewMode ? onSetViewMode('carousel') : onViewModeToggle();
            }}
            style={[styles.modePill, viewMode === 'carousel' ? styles.modePillActive : null]}
          >
            <Text
              style={[
                styles.modePillText,
                viewMode === 'carousel' ? styles.modePillTextActive : null,
              ]}
            >
              Hero Carousel
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Switch to Workbench Stream"
            onPress={() => {
              hapticLight();
              onSetViewMode ? onSetViewMode('stream') : onViewModeToggle();
            }}
            style={[styles.modePill, viewMode === 'stream' ? styles.modePillActive : null]}
          >
            <Text
              style={[
                styles.modePillText,
                viewMode === 'stream' ? styles.modePillTextActive : null,
              ]}
            >
              Workbench Stream
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Universal Workspace Canvas */}
      <WorkspaceCanvas
        depthPreset="sanctuary-calm"
        spatialArrangement={spatialMode}
        surfaces={surfaceDefinitions}
        layout={workspaceLayout}
        getSurfaceEmoji={(surface) => featureMap.get(surface.surfaceId)?.emoji}
        getSurfaceCategory={(surface) => featureMap.get(surface.surfaceId)?.category}
        getSurfaceEnergyVibe={(surface) => featureMap.get(surface.surfaceId)?.energyVibe}
        renderSurfaceContent={(surface) => {
          const feature = featureMap.get(surface.surfaceId);
          if (!feature) return null;
          return (
            <SelfFeatureRenderer
              componentId={feature.componentId}
              featureId={feature.id}
              userId={userId}
              compact={spatialMode !== 'stream'}
            />
          );
        }}
        onSurfacePress={(surface) => {
          const feature = featureMap.get(surface.surfaceId);
          if (!feature) return;
          if (onFeaturePress) {
            onFeaturePress(feature);
          } else {
            setActiveModalFeature(feature);
          }
        }}
        onToggleHidden={(surface) => onToggleHidden(surface.surfaceId, !surface.hidden)}
        onTogglePin={(surface) => onTogglePin(surface.surfaceId)}
        onReorder={(surfaceId, newIndex) => {
          const ids = features.map((f) => f.id);
          const currentIndex = ids.indexOf(surfaceId);
          if (currentIndex === -1) return;
          const next = [...ids];
          const [removed] = next.splice(currentIndex, 1);
          if (removed) next.splice(newIndex, 0, removed);
          onReorder(next);
        }}
      />

      {/* Deep Feature Inspector Modal for Tile / Discovery mode */}
      {activeModalFeature ? (
        <SanctuaryModal
          isOpen={Boolean(activeModalFeature)}
          onClose={() => setActiveModalFeature(null)}
          title={`${activeModalFeature.emoji} ${activeModalFeature.label}`}
          subtitle={activeModalFeature.category?.toUpperCase()}
          size="lg"
        >
          <Box className="py-2">
            <SelfFeatureRenderer
              componentId={activeModalFeature.componentId}
              featureId={activeModalFeature.id}
              userId={userId}
              compact={false}
            />
          </Box>
        </SanctuaryModal>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Theme.spacing.md,
  },
  modeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  modePillGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Theme.corners.full,
    borderWidth: 1.25,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.silk,
    padding: 3,
    gap: 3,
    boxShadow: '0px 1.5px 0px rgba(107, 100, 128, 0.12)',
  },
  modePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Theme.corners.full,
  },
  modePillActive: {
    backgroundColor: Theme.colors.inkTruth,
  },
  modePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Theme.colors.bark,
  },
  modePillTextActive: {
    color: Theme.colors.sacredWhite,
  },
});

export default SelfCanvas;
