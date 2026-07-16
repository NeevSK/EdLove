import {
  groupResolvedWorkspaceSurfacesByZone,
  resolveWorkspaceSurfaceLayout,
} from '@repo/core/logic';
import type { WorkspaceRendererConfig } from '@repo/core/types';
import { LayoutGrid, Pin } from '@repo/ui/icons';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { Text } from '../../gluestack';
import { useThemedColors } from '../../hooks/useThemedColors';
import { View } from '../../primitives';
import { Theme } from '../../theme/Theme';
import type { WorkspaceCanvasProps } from './types';

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
}: {
  title: string;
  subtitle: string;
  visibleCount: number;
  pinnedCount: number;
  renderer: WorkspaceRendererConfig;
}) {
  const colors = useThemedColors();
  const styles = createStyles(colors);

  return (
    <View style={styles.hero}>
      <View style={styles.heroGlow} />
      <View style={styles.heroHeader}>
        <View style={styles.heroCopy}>
          <Text style={styles.kicker}>CAPABILITY CANVAS</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <View style={styles.metrics}>
          <View style={styles.metricPill}>
            <LayoutGrid size={14} color={Theme.colors.inkTruth} />
            <Text style={styles.metricText}>{visibleCount} surfaces</Text>
          </View>
          <View style={styles.metricPillMuted}>
            <Pin size={14} color={colors.textSecondary} />
            <Text style={styles.metricTextMuted}>{pinnedCount} pinned</Text>
          </View>
          <View style={styles.rendererPill}>
            <Text style={styles.rendererText}>
              {renderer.platform.toUpperCase()} {String.fromCharCode(8226)}{' '}
              {renderer.mode.toUpperCase()}
            </Text>
          </View>
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
      <Text style={styles.emptyTitle}>Canvas ready for adoption</Text>
      <Text style={styles.emptyText}>{emptyMessage}</Text>
    </View>
  );
}

function createStyles(colors: ReturnType<typeof useThemedColors>) {
  return StyleSheet.create({
    hero: {
      position: 'relative',
      overflow: 'hidden',
      borderRadius: 32,
      padding: Theme.spacing.lg,
      backgroundColor: Theme.colors.inkTruth,
      ...Theme.shadows.lg,
    },
    heroGlow: {
      position: 'absolute',
      top: -80,
      right: -30,
      width: 220,
      height: 220,
      borderRadius: 999,
      backgroundColor: 'rgba(246, 191, 140, 0.22)',
    },
    heroHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: Theme.spacing.md,
    },
    heroCopy: {
      flex: 1,
      gap: 6,
    },
    kicker: {
      fontSize: Theme.typography.fontSize.xs,
      fontWeight: '700',
      letterSpacing: 1.4,
      color: Theme.colors.saffronWhisper,
    },
    title: {
      fontSize: Theme.typography.fontSize['2xl'],
      fontWeight: '700',
      color: Theme.colors.sacredWhite,
    },
    subtitle: {
      maxWidth: 620,
      fontSize: Theme.typography.fontSize.md,
      lineHeight: 22,
      color: Theme.colors.starlightGray,
    },
    metrics: {
      alignItems: 'flex-end',
      gap: Theme.spacing.xs,
    },
    metricPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      borderRadius: Theme.corners.full,
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: Theme.colors.templeGold,
    },
    metricPillMuted: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      borderRadius: Theme.corners.full,
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: 'rgba(252, 249, 242, 0.08)',
      borderWidth: 1,
      borderColor: 'rgba(252, 249, 242, 0.14)',
    },
    rendererPill: {
      borderRadius: Theme.corners.full,
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: 'rgba(246, 191, 140, 0.14)',
      borderWidth: 1,
      borderColor: 'rgba(246, 191, 140, 0.18)',
    },
    metricText: {
      fontSize: Theme.typography.fontSize.sm,
      fontWeight: '700',
      color: Theme.colors.inkTruth,
    },
    metricTextMuted: {
      fontSize: Theme.typography.fontSize.sm,
      fontWeight: '600',
      color: Theme.colors.sacredWhite,
    },
    rendererText: {
      fontSize: Theme.typography.fontSize.xs,
      fontWeight: '700',
      color: Theme.colors.sacredWhite,
      letterSpacing: 0.8,
    },
    emptyState: {
      borderRadius: Theme.corners.generous,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: Theme.colors.saffronMuted,
      backgroundColor: Theme.colors.silk,
      padding: Theme.spacing.xl,
      gap: Theme.spacing.xs,
    },
    emptyTitle: {
      fontSize: Theme.typography.fontSize.xl,
      fontWeight: '700',
      color: colors.text,
    },
    emptyText: {
      fontSize: Theme.typography.fontSize.md,
      lineHeight: 22,
      color: colors.textSecondary,
    },
  });
}
