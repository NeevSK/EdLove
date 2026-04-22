import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import type { ResolvedWorkspaceSurface, WorkspaceZoneLayoutGroup } from '@repo/core/logic';
import { Theme } from '../../theme/Theme';
import { useThemedColors } from '../../hooks/useThemedColors';
import { Text } from '../../gluestack';
import { CanvasSurfaceCard } from './CanvasSurfaceCard';

export interface CanvasZoneColumnProps<
    TSurfaceId extends string = string,
    TCapabilityKey extends string = string,
> {
    group: WorkspaceZoneLayoutGroup<TSurfaceId, TCapabilityKey>;
    title?: string;
    description?: string;
    renderSurfaceContent?: (surface: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>) => React.ReactNode;
    getSurfaceTitle?: (surface: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>) => string;
    getSurfaceSubtitle?: (surface: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>) => string | undefined;
    getSurfaceSummary?: (surface: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>) => string | undefined;
    getSurfaceSnapshot?: (surface: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>) => string | undefined;
    getSurfaceTemporalLabel?: (surface: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>) => string | undefined;
    getSurfaceTemporalTone?: (
        surface: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>
    ) => 'present' | 'past' | 'future' | 'neutral' | undefined;
    getSurfaceMetadata?: (surface: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>) => string[] | undefined;
    renderSurfaceActions?: (surface: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>) => React.ReactNode;
    onSurfacePress?: (surface: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>) => void;
    onPressSurfaceInfo?: (surface: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>) => void;
    onToggleHidden?: (surface: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>) => void;
    emptyMessage?: string;
    compact?: boolean;
    style?: StyleProp<ViewStyle>;
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
    emptyMessage = 'No visible surfaces in this zone yet.',
    compact = false,
    style,
}: CanvasZoneColumnProps<TSurfaceId, TCapabilityKey>) {
    const colors = useThemedColors();
    const styles = createStyles(colors);

    return (
        <View style={[styles.column, compact ? styles.columnCompact : null, style]}>
            <View style={styles.header}>
                <Text style={styles.title}>{title ?? ZONE_TITLES[group.zone] ?? group.zone}</Text>
                <Text style={styles.description}>
                    {description ?? ZONE_DESCRIPTIONS[group.zone] ?? 'Shared workspace zone.'}
                </Text>
            </View>
            <View style={styles.body}>
                {group.surfaces.length ? (
                    group.surfaces.map((surface) => (
                        <CanvasSurfaceCard
                            key={surface.surfaceId}
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
                        />
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
        title: {
            fontSize: Theme.typography.fontSize.xl,
            fontWeight: '700',
            color: colors.text,
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
