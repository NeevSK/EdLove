import React, { useMemo } from 'react';
import { useWindowDimensions, type ViewStyle } from 'react-native';
import { resolveWorkspaceSurfaceLayout, type WorkspaceLayout } from '@repo/core';
import { Box, HStack, Text, Theme, VStack, useThemedColors } from '@repo/ui';
import type {
    TeacherDashboardCapabilityKey,
    TeacherDashboardSurface,
    TeacherDashboardSurfaceId,
} from '../../workspace/useTeacherDashboardSurfaces';

interface TeacherWorkspaceShellProps {
    surfaces: TeacherDashboardSurface[];
    layout: WorkspaceLayout<TeacherDashboardSurfaceId>;
    title: string;
    subtitle: string;
    stats: {
        activeClasses: number;
        totalStudents: number;
    };
    isDemoMode: boolean;
}

type ResolvedTeacherSurface = ReturnType<
    typeof resolveWorkspaceSurfaceLayout<TeacherDashboardSurfaceId, TeacherDashboardCapabilityKey>
>[number];

type SurfaceSlot = {
    definition: TeacherDashboardSurface;
    surface: ResolvedTeacherSurface;
} | null;

export function TeacherWorkspaceShell({
    surfaces,
    layout,
    title,
    subtitle,
    stats,
    isDemoMode,
}: TeacherWorkspaceShellProps) {
    const colors = useThemedColors();
    const { width } = useWindowDimensions();
    const isDesktop = width >= 1024;

    const resolvedSurfaces = useMemo(
        () => resolveWorkspaceSurfaceLayout<TeacherDashboardSurfaceId, TeacherDashboardCapabilityKey>(surfaces, layout),
        [layout, surfaces]
    );

    const visibleSurfaces = useMemo(
        () => resolvedSurfaces.filter((surface) => !surface.hidden),
        [resolvedSurfaces]
    );

    const surfaceSlots = useMemo(
        () => createSurfaceSlotMap(surfaces, visibleSurfaces),
        [surfaces, visibleSurfaces]
    );

    const heroMetrics = [
        { label: 'Active classes', value: String(stats.activeClasses).padStart(2, '0') },
        { label: 'Students held', value: String(stats.totalStudents).padStart(2, '0') },
        { label: 'Capabilities live', value: String(visibleSurfaces.length).padStart(2, '0') },
    ];

    const mobilePanels = [
        surfaceSlots['primary-actions'],
        surfaceSlots['classroom-registry'],
        surfaceSlots['temporal-context'],
        surfaceSlots.pulse,
        surfaceSlots['support-tools'],
    ].filter((slot): slot is NonNullable<SurfaceSlot> => Boolean(slot));

    return (
        <VStack style={{ gap: Theme.spacing.lg }}>
            <Box style={heroCard(colors)}>
                <Box style={heroGlowTop} />
                <Box style={heroGlowBottom} />

                <VStack style={{ gap: Theme.spacing.lg }}>
                    <HStack
                        style={{
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            gap: Theme.spacing.md,
                            flexWrap: 'wrap',
                        }}
                    >
                        <VStack style={{ flex: 1, minWidth: 240, gap: Theme.spacing.sm }}>
                            <HStack style={{ gap: Theme.spacing.xs, flexWrap: 'wrap' }}>
                                <HeroBadge label={title} />
                                <HeroBadge label="Teacher role" tone="muted" />
                                {isDemoMode ? <HeroBadge label="Demo data" tone="accent" /> : null}
                            </HStack>

                            <VStack style={{ gap: 6 }}>
                                <Text style={heroEyebrow(colors)}>Classroom workspace</Text>
                                <Text
                                    style={{
                                        fontSize: isDesktop ? Theme.typography.fontSize['3xl'] : Theme.typography.fontSize['2xl'],
                                        lineHeight: isDesktop ? 44 : 34,
                                        fontWeight: '700',
                                        color: colors.text,
                                    }}
                                >
                                    Registry & Resonance.
                                </Text>
                                <Text style={heroCopy(colors)}>
                                    Classroom registry becomes the working surface. Actions stay close, pulse stays readable,
                                    and the teacher role leads from one calm operational shell.
                                </Text>
                            </VStack>
                        </VStack>

                        <Box
                            style={{
                                minWidth: isDesktop ? 250 : width - Theme.spacing.lg * 2,
                                backgroundColor: 'rgba(250, 247, 237, 0.68)',
                                borderWidth: 1,
                                borderColor: colors.border,
                                borderRadius: 24,
                                padding: Theme.spacing.md,
                            }}
                        >
                            <VStack style={{ gap: Theme.spacing.sm }}>
                                <Text style={sectionEyebrow(colors)}>Workspace frame</Text>
                                <Text style={{ fontSize: Theme.typography.fontSize.sm, lineHeight: 22, color: colors.text }}>
                                    {subtitle}
                                </Text>
                            </VStack>
                        </Box>
                    </HStack>

                    <HStack style={{ gap: Theme.spacing.md, flexWrap: 'wrap' }}>
                        {heroMetrics.map((metric) => (
                            <HeroMetricCard key={metric.label} label={metric.label} value={metric.value} />
                        ))}
                    </HStack>
                </VStack>
            </Box>

            {isDesktop ? (
                <HStack style={{ alignItems: 'flex-start', gap: Theme.spacing.lg }}>
                    <VStack style={{ flex: 1.75, gap: Theme.spacing.lg }}>
                        <SurfacePanel slot={surfaceSlots['classroom-registry']} emphasis="primary" />
                        <HStack style={{ alignItems: 'flex-start', gap: Theme.spacing.lg }}>
                            <Box style={{ flex: 1.1 }}>
                                <SurfacePanel slot={surfaceSlots['temporal-context']} />
                            </Box>
                            <Box style={{ flex: 0.9 }}>
                                <SurfacePanel slot={surfaceSlots.pulse} />
                            </Box>
                        </HStack>
                    </VStack>

                    <VStack style={{ width: 320, gap: Theme.spacing.lg }}>
                        <SurfacePanel slot={surfaceSlots['primary-actions']} />
                        <SurfacePanel slot={surfaceSlots['support-tools']} />
                    </VStack>
                </HStack>
            ) : (
                <VStack style={{ gap: Theme.spacing.lg }}>
                    {mobilePanels.map((slot) => (
                        <SurfacePanel
                            key={slot.surface.surfaceId}
                            slot={slot}
                            emphasis={slot.surface.surfaceId === 'classroom-registry' ? 'primary' : 'default'}
                        />
                    ))}
                </VStack>
            )}
        </VStack>
    );
}

function createSurfaceSlotMap(
    definitions: TeacherDashboardSurface[],
    resolvedSurfaces: ResolvedTeacherSurface[]
) {
    return definitions.reduce(
        (acc, definition) => {
            const resolved = resolvedSurfaces.find((surface) => surface.surfaceId === definition.surfaceId);
            acc[definition.surfaceId] = resolved ? { definition, surface: resolved } : null;
            return acc;
        },
        {
            'temporal-context': null,
            'primary-actions': null,
            'support-tools': null,
            pulse: null,
            'classroom-registry': null,
        } as Record<TeacherDashboardSurfaceId, SurfaceSlot>
    );
}

function HeroBadge({
    label,
    tone = 'default',
}: {
    label: string;
    tone?: 'default' | 'muted' | 'accent';
}) {
    const colors = useThemedColors();

    const backgroundColor =
        tone === 'accent'
            ? 'rgba(246, 191, 140, 0.18)'
            : tone === 'muted'
              ? 'rgba(42, 35, 24, 0.05)'
              : 'rgba(184, 169, 224, 0.16)';

    const color = tone === 'accent' ? Theme.colors.saffronMuted : colors.text;

    return (
        <Box
            style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: Theme.corners.full,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor,
            }}
        >
            <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 1.1, textTransform: 'uppercase', color }}>
                {label}
            </Text>
        </Box>
    );
}

function HeroMetricCard({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    const colors = useThemedColors();

    return (
        <Box
            style={{
                flexGrow: 1,
                minWidth: 132,
                paddingHorizontal: Theme.spacing.md,
                paddingVertical: Theme.spacing.md,
                borderRadius: 22,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: 'rgba(252, 249, 242, 0.74)',
            }}
        >
            <Text style={sectionEyebrow(colors)}>{label}</Text>
            <Text
                style={{
                    marginTop: 10,
                    fontSize: Theme.typography.fontSize['2xl'],
                    fontWeight: '700',
                    color: colors.text,
                }}
            >
                {value}
            </Text>
        </Box>
    );
}

function SurfacePanel({
    slot,
    emphasis = 'default',
}: {
    slot: SurfaceSlot;
    emphasis?: 'default' | 'primary';
}) {
    const colors = useThemedColors();

    if (!slot) {
        return null;
    }

    return (
        <Box
            style={{
                borderRadius: emphasis === 'primary' ? 30 : 26,
                padding: Theme.spacing.lg,
                backgroundColor: emphasis === 'primary' ? colors.secondary : colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                ...Theme.shadows.md,
            }}
        >
            <VStack style={{ gap: Theme.spacing.md }}>
                <VStack style={{ gap: Theme.spacing.sm }}>
                    <HStack style={{ alignItems: 'center', justifyContent: 'space-between', gap: Theme.spacing.md }}>
                        <VStack style={{ flex: 1, gap: 4 }}>
                            <Text style={sectionEyebrow(colors)}>
                                {slot.definition.subtitle || 'Capability surface'}
                            </Text>
                            <Text
                                style={{
                                    fontSize: emphasis === 'primary' ? Theme.typography.fontSize.xl : Theme.typography.fontSize.lg,
                                    fontWeight: '700',
                                    color: colors.text,
                                }}
                            >
                                {slot.definition.title}
                            </Text>
                        </VStack>

                        {slot.definition.temporalLabel ? (
                            <Box
                                style={{
                                    paddingHorizontal: 12,
                                    paddingVertical: 8,
                                    borderRadius: Theme.corners.full,
                                    backgroundColor: 'rgba(246, 191, 140, 0.16)',
                                    borderWidth: 1,
                                    borderColor: colors.border,
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: 11,
                                        fontWeight: '700',
                                        textTransform: 'uppercase',
                                        letterSpacing: 1.2,
                                        color: Theme.colors.saffronMuted,
                                    }}
                                >
                                    {slot.definition.temporalLabel}
                                </Text>
                            </Box>
                        ) : null}
                    </HStack>

                    {slot.definition.summary ? (
                        <Text style={{ fontSize: Theme.typography.fontSize.sm, lineHeight: 22, color: colors.textSecondary }}>
                            {slot.definition.summary}
                        </Text>
                    ) : null}

                    {Array.isArray(slot.definition.metadata) && slot.definition.metadata.length > 0 ? (
                        <HStack style={{ gap: Theme.spacing.xs, flexWrap: 'wrap' }}>
                            {slot.definition.metadata.map((item) => (
                                <Box key={item} style={metadataPill(colors)}>
                                    <Text style={metadataPillText(colors)}>{item}</Text>
                                </Box>
                            ))}
                        </HStack>
                    ) : null}
                </VStack>

                <Box>{slot.definition.content}</Box>
            </VStack>
        </Box>
    );
}

function heroCard(colors: ReturnType<typeof useThemedColors>): ViewStyle {
    return {
        borderRadius: 30,
        padding: Theme.spacing.lg,
        backgroundColor: colors.secondary,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
        ...Theme.shadows.lg,
    };
}

const heroGlowTop: ViewStyle = {
    position: 'absolute',
    top: -18,
    right: -14,
    width: 180,
    height: 180,
    borderRadius: Theme.corners.full,
    backgroundColor: 'rgba(246, 191, 140, 0.22)',
};

const heroGlowBottom: ViewStyle = {
    position: 'absolute',
    bottom: -48,
    left: -18,
    width: 160,
    height: 160,
    borderRadius: Theme.corners.full,
    backgroundColor: 'rgba(184, 169, 224, 0.12)',
};

function heroEyebrow(colors: ReturnType<typeof useThemedColors>) {
    return {
        fontSize: 12,
        fontWeight: '700' as const,
        letterSpacing: 1.8,
        textTransform: 'uppercase' as const,
        color: colors.textSecondary,
    };
}

function heroCopy(colors: ReturnType<typeof useThemedColors>) {
    return {
        maxWidth: 640,
        fontSize: Theme.typography.fontSize.sm,
        lineHeight: 22,
        color: colors.textSecondary,
    };
}

function sectionEyebrow(colors: ReturnType<typeof useThemedColors>) {
    return {
        fontSize: 11,
        fontWeight: '700' as const,
        letterSpacing: 1.4,
        textTransform: 'uppercase' as const,
        color: colors.textSecondary,
    };
}

function metadataPill(colors: ReturnType<typeof useThemedColors>): ViewStyle {
    return {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: Theme.corners.full,
        backgroundColor: 'rgba(42, 35, 24, 0.04)',
        borderWidth: 1,
        borderColor: colors.border,
    };
}

function metadataPillText(colors: ReturnType<typeof useThemedColors>) {
    return {
        fontSize: 10,
        fontWeight: '700' as const,
        letterSpacing: 1.1,
        textTransform: 'uppercase' as const,
        color: colors.textSecondary,
    };
}

export default TeacherWorkspaceShell;
