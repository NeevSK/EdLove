import {
  getMaxPinnedForWorkspace,
  groupResolvedWorkspaceSurfacesByZone,
  MAX_PINNED_WORKSPACE_SURFACES,
  resolveWorkspaceSurfaceLayout,
} from '@repo/core/logic';
import type { WorkspaceRendererConfig } from '@repo/core/types';
import type { WorkspaceCanvasProps } from '@repo/ui/components/workspace/types';
import { useThemedColors } from '@repo/ui/hooks/useThemedColors';
import { LayoutGrid, Pin } from '@repo/ui/icons';
import { Text, View } from '@repo/ui/primitives';
import { Theme } from '@repo/ui/theme/Theme';
import { createContext, useContext, useMemo } from 'react';
import { StyleSheet } from 'react-native';

export interface WorkspaceRendererContextType {
  runtimePlatform: 'mobile' | 'tablet' | 'web';
  width: number;
  height: number;
  isNative: boolean;
  isResizing: boolean;
}

export const WorkspaceRendererContext = createContext<WorkspaceRendererContextType | null>(null);

export function useWorkspaceRendererContext() {
  const context = useContext(WorkspaceRendererContext);
  if (!context) {
    throw new Error(
      'useWorkspaceRendererContext must be used within WorkspaceRendererContext.Provider',
    );
  }
  return context;
}

export function useWorkspaceCanvasData<
  TSurfaceId extends string = string,
  TCapabilityKey extends string = string,
>({
  surfaces,
  layout,
  includeHidden = false,
}: Pick<
  WorkspaceCanvasProps<TSurfaceId, TCapabilityKey>,
  'surfaces' | 'layout' | 'includeHidden'
>) {
  const resolved = useMemo(
    () => resolveWorkspaceSurfaceLayout(surfaces, layout),
    [surfaces, layout],
  );

  const groups = useMemo(
    () => groupResolvedWorkspaceSurfacesByZone(resolved, { includeHidden }),
    [resolved, includeHidden],
  );

  const visibleCount = includeHidden
    ? resolved.length
    : resolved.filter((surface) => !surface.hidden).length;
  const pinnedCount = resolved.filter(
    (surface) => surface.pinned && (includeHidden || !surface.hidden),
  ).length;

  return {
    resolved,
    groups,
    visibleCount,
    pinnedCount,
  };
}

export function WorkspaceCanvasHero({
  title,
  subtitle,
  visibleCount,
  pinnedCount,
  renderer,
  workspaceId,
}: {
  title: string;
  subtitle: string;
  visibleCount: number;
  pinnedCount: number;
  renderer: WorkspaceRendererConfig;
  workspaceId?: string;
}) {
  const colors = useThemedColors();
  const styles = createStyles(colors);
  const maxPinned = workspaceId
    ? getMaxPinnedForWorkspace(workspaceId)
    : MAX_PINNED_WORKSPACE_SURFACES;

  return (
    <View style={styles.hero}>
      <View style={styles.heroHeader}>
        <View style={styles.heroCopy}>
          <Text style={styles.kicker}>WORKSPACE · {renderer.platform.toUpperCase()}</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <View style={styles.metrics}>
          <View style={styles.metricChip}>
            <LayoutGrid size={13} color={colors.text} />
            <Text style={styles.metricText}>{visibleCount} surfaces</Text>
          </View>
          {pinnedCount > 0 ? (
            <View style={styles.metricChip}>
              <Pin size={12} color={Theme.colors.sanctuarySaffron} />
              <Text style={styles.metricText}>
                {pinnedCount}/{maxPinned} pinned
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

export function WorkspaceCanvasEmptyState({ emptyMessage }: { emptyMessage: string }) {
  const colors = useThemedColors();
  const styles = createStyles(colors);

  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>Workspace Ready</Text>
      <Text style={styles.emptyText}>{emptyMessage}</Text>
    </View>
  );
}

export function clampReorderIndex(currentIndex: number, shift: number, itemCount: number) {
  if (itemCount <= 0) return 0;
  return Math.max(0, Math.min(itemCount - 1, currentIndex + shift));
}

export function resolveReorderTarget(currentIndex: number, shift: -1 | 1, itemCount: number) {
  return clampReorderIndex(currentIndex, shift, itemCount);
}

export function resolveDragTranslation(
  axis: 'vertical' | 'both',
  translation: { x: number; y: number },
) {
  return axis === 'vertical' ? { x: 0, y: translation.y } : translation;
}

export const DEPTH_PRESETS = {
  'sanctuary-calm': {
    id: 'sanctuary-calm' as const,
    name: 'Sanctuary Calm',
    showDots: true,
    dotColor: '#544A3D',
    dotOpacity: 0.08,
    dotSpacing: 18,
    borderWidth: 1.25,
    borderColor: '#E8E2CF',
    rimOffset: 1.5,
    rimColor: 'rgba(107, 100, 128, 0.16)',
    borderRadius: 14,
  },
  'architectural-ink': {
    id: 'architectural-ink' as const,
    name: 'Architectural Ink',
    showDots: true,
    dotColor: '#2A2318',
    dotOpacity: 0.12,
    dotSpacing: 16,
    borderWidth: 1.5,
    borderColor: '#2A2318',
    rimOffset: 2.5,
    rimColor: '#2A2318',
    borderRadius: 12,
  },
  'flat-zen': {
    id: 'flat-zen' as const,
    name: 'Flat Zen',
    showDots: false,
    dotColor: '#544A3D',
    dotOpacity: 0,
    dotSpacing: 0,
    borderWidth: 1,
    borderColor: '#E8E2CF',
    rimOffset: 0,
    rimColor: 'transparent',
    borderRadius: 16,
  },
};

function createStyles(colors: ReturnType<typeof useThemedColors>) {
  return StyleSheet.create({
    hero: {
      borderRadius: Theme.corners.comfortable,
      paddingHorizontal: Theme.spacing.md,
      paddingVertical: Theme.spacing.sm,
      backgroundColor: colors.card,
      borderWidth: 1.25,
      borderColor: Theme.colors.border,
      boxShadow: '0px 1.5px 0px rgba(107, 100, 128, 0.14)',
    },
    heroHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: Theme.spacing.md,
    },
    heroCopy: {
      flex: 1,
      gap: 2,
    },
    kicker: {
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 1,
      color: Theme.colors.saffronMuted,
    },
    title: {
      fontSize: Theme.typography.fontSize.lg,
      fontWeight: '700',
      color: colors.text,
    },
    subtitle: {
      fontSize: Theme.typography.fontSize.xs,
      color: colors.textSecondary,
    },
    metrics: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    metricChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      borderRadius: Theme.corners.full,
      paddingHorizontal: 8,
      paddingVertical: 4,
      backgroundColor: Theme.colors.silk,
      borderWidth: 1,
      borderColor: Theme.colors.border,
    },
    metricText: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.text,
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: Theme.spacing.xl,
      borderRadius: Theme.corners.comfortable,
      borderWidth: 1.25,
      borderColor: Theme.colors.border,
      backgroundColor: colors.card,
      gap: 4,
    },
    emptyTitle: {
      fontSize: Theme.typography.fontSize.sm,
      fontWeight: '700',
      color: colors.text,
    },
    emptyText: {
      fontSize: Theme.typography.fontSize.xs,
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });
}
