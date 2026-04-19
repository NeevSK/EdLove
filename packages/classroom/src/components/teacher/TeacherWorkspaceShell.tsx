import React, { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { resolveWorkspaceSurfaceLayout, type WorkspaceLayout } from '@repo/core';
import { Box, HStack, Text, VStack, Heading } from '@repo/ui';
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
        <VStack className="gap-8">
            <Box className="bg-sanctuary-surface-secondary rounded-[32px] p-8 border border-sanctuary-border/10 overflow-hidden shadow-sm relative">
                {/* Decorative Glow Elements */}
                <Box className="absolute -top-4 -right-4 w-44 h-44 rounded-full bg-sanctuarySaffron/10" />
                <Box className="absolute -bottom-12 -left-4 w-40 h-40 rounded-full bg-gurudeviBlue/5" />

                <VStack className="gap-8 relative">
                    <HStack className="items-start justify-between gap-6 flex-wrap">
                        <VStack className="flex-1 min-w-[240px] gap-4">
                            <HStack className="gap-2 flex-wrap">
                                <HeroBadge label={title} />
                                <HeroBadge label="Teacher role" tone="muted" />
                                {isDemoMode ? <HeroBadge label="Demo data" tone="accent" /> : null}
                            </HStack>

                            <VStack className="gap-2 mt-2">
                                <Text className="text-sanctuary-text-muted text-[10px] font-bold uppercase tracking-[0.2em] ml-0.5">
                                    Classroom workspace
                                </Text>
                                <Heading className="text-sanctuary-text text-3xl font-bold leading-tight lg:text-4xl">
                                    Registry & Resonance.
                                </Heading>
                                <Text className="text-sanctuary-text-muted text-sm leading-6 max-w-2xl">
                                    Classroom registry becomes the working surface. Actions stay close, pulse stays readable,
                                    and the teacher role leads from one calm operational shell.
                                </Text>
                            </VStack>
                        </VStack>

                        <Box className="min-w-[280px] bg-sanctuary-surface/40 border border-sanctuary-border/10 rounded-2xl p-6 lg:min-w-[320px]">
                            <VStack className="gap-2">
                                <Text className="text-sanctuary-text-muted text-[10px] font-bold uppercase tracking-[0.15em]">
                                    Workspace frame
                                </Text>
                                <Text className="text-sanctuary-text text-sm leading-6">
                                    {subtitle}
                                </Text>
                            </VStack>
                        </Box>
                    </HStack>

                    <HStack className="gap-4 flex-wrap">
                        {heroMetrics.map((metric) => (
                            <HeroMetricCard key={metric.label} label={metric.label} value={metric.value} />
                        ))}
                    </HStack>
                </VStack>
            </Box>

            {isDesktop ? (
                <HStack className="items-start gap-8">
                    <VStack className="flex-[1.75] gap-8">
                        <SurfacePanel slot={surfaceSlots['classroom-registry']} emphasis="primary" />
                        <HStack className="items-start gap-8">
                            <Box className="flex-[1.1]">
                                <SurfacePanel slot={surfaceSlots['temporal-context']} />
                            </Box>
                            <Box className="flex-[0.9]">
                                <SurfacePanel slot={surfaceSlots.pulse} />
                            </Box>
                        </HStack>
                    </VStack>

                    <VStack className="w-80 gap-8">
                        <SurfacePanel slot={surfaceSlots['primary-actions']} />
                        <SurfacePanel slot={surfaceSlots['support-tools']} />
                    </VStack>
                </HStack>
            ) : (
                <VStack className="gap-8">
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
    const badgeStyle = useMemo(() => {
        switch (tone) {
            case 'accent':
                return 'bg-sanctuarySaffron/10 border-sanctuarySaffron/20 text-sanctuarySaffron';
            case 'muted':
                return 'bg-sanctuary-text-muted/5 border-sanctuary-border/10 text-sanctuary-text-muted';
            default:
                return 'bg-gurudeviBlue/10 border-gurudeviBlue/20 text-gurudeviBlue';
        }
    }, [tone]);

    return (
        <Box
            className={`px-3 py-1.5 rounded-full border ${badgeStyle}`}
        >
            <Text className="text-[10px] font-bold tracking-[0.1em] uppercase inherit-color">
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
    return (
        <Box className="flex-1 min-w-[140px] px-6 py-6 rounded-2xl border border-sanctuary-border/10 bg-sanctuary-surface/60 shadow-sm">
            <Text className="text-sanctuary-text-muted text-[10px] font-bold uppercase tracking-[0.1em]">
                {label}
            </Text>
            <Text className="text-sanctuary-text text-2xl font-bold mt-2">
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
    if (!slot) {
        return null;
    }

    const isPrimary = emphasis === 'primary';

    return (
        <Box
            className={`rounded-[32px] p-8 border border-sanctuary-border/10 shadow-md ${
                isPrimary ? 'bg-sanctuary-surface-secondary' : 'bg-sanctuary-surface'
            }`}
        >
            <VStack className="gap-6">
                <VStack className="gap-4">
                    <HStack className="items-center justify-between gap-6">
                        <VStack className="flex-1 gap-1">
                            <Text className="text-sanctuary-text-muted text-[10px] font-bold uppercase tracking-[0.15em]">
                                {slot.definition.subtitle || 'Capability surface'}
                            </Text>
                            <Heading size="md" className="text-sanctuary-text font-bold">
                                {slot.definition.title}
                            </Heading>
                        </VStack>

                        {slot.definition.temporalLabel ? (
                            <Box className="px-3 py-1.5 rounded-full bg-sanctuarySaffron/10 border border-sanctuary-border/10">
                                <Text className="text-[10px] font-bold uppercase tracking-[0.1em] text-sanctuarySaffron">
                                    {slot.definition.temporalLabel}
                                </Text>
                            </Box>
                        ) : null}
                    </HStack>

                    {slot.definition.summary ? (
                        <Text className="text-sanctuary-text-muted text-sm leading-6">
                            {slot.definition.summary}
                        </Text>
                    ) : null}

                    {Array.isArray(slot.definition.metadata) && slot.definition.metadata.length > 0 ? (
                        <HStack className="gap-2 flex-wrap">
                            {slot.definition.metadata.map((item) => (
                                <Box 
                                    key={item} 
                                    className="px-2.5 py-1 rounded-full bg-sanctuary-text-muted/5 border border-sanctuary-border/10"
                                >
                                    <Text className="text-[9px] font-bold uppercase tracking-[0.05em] text-sanctuary-text-muted">
                                        {item}
                                    </Text>
                                </Box>
                            ))}
                        </HStack>
                    ) : null}
                </VStack>

                <Box className="mt-2">{slot.definition.content}</Box>
            </VStack>
        </Box>
    );
}

export default TeacherWorkspaceShell;
