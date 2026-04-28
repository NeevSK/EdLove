import { resolveWorkspaceSurfaceLayout, type WorkspaceLayout } from '@repo/core';
import { Box, Heading, HStack, Text, useResponsive, VStack } from '@repo/ui';
import React, { useMemo } from 'react';
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
  const { isDesktop } = useResponsive();

  const resolvedSurfaces = useMemo(
    () =>
      resolveWorkspaceSurfaceLayout<TeacherDashboardSurfaceId, TeacherDashboardCapabilityKey>(
        surfaces,
        layout,
      ),
    [layout, surfaces],
  );

  const visibleSurfaces = useMemo(
    () => resolvedSurfaces.filter((surface) => !surface.hidden),
    [resolvedSurfaces],
  );

  const surfaceSlots = useMemo(
    () => createSurfaceSlotMap(surfaces, visibleSurfaces),
    [surfaces, visibleSurfaces],
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
      <Box className="bg-sanctuary-surface-secondary/40 rounded-[32px] p-8 border border-sanctuary-border overflow-hidden relative">
        {/* Decorative Glow Elements */}
        <Box className="absolute -top-4 -right-4 w-44 h-44 rounded-full bg-sanctuarySaffron/5 opacity-[0.03]" />
        <Box className="absolute -bottom-12 -left-4 w-40 h-40 rounded-full bg-sanctuary-info/5 opacity-[0.03]" />

        <VStack className="gap-8 relative">
          <HStack className="items-start justify-between gap-6 flex-wrap">
            <VStack className="flex-1 min-w-[240px] gap-6">
              <HStack className="gap-2.5 flex-wrap">
                <HeroBadge label={title} />
                <HeroBadge label="Teacher role" tone="muted" />
                {isDemoMode ? <HeroBadge label="Demo data" tone="accent" /> : null}
              </HStack>

              <VStack className="gap-3 mt-2">
                <Text className="text-sanctuary-text-tertiary text-[10px] font-black uppercase tracking-[0.3em] ml-0.5">
                  Classroom workspace
                </Text>
                <Heading className="text-sanctuary-text text-4xl font-black leading-[1.1] tracking-tighter lg:text-5xl">
                  Registry & Resonance.
                </Heading>
                <Text className="text-sanctuary-text text-sm leading-relaxed max-w-2xl font-medium opacity-80">
                  Classroom registry becomes the working surface. Actions stay close, pulse stays
                  readable, and the teacher role leads from one calm operational shell.
                </Text>
              </VStack>
            </VStack>

            <Box className="min-w-[280px] bg-sanctuary-surface border border-sanctuary-border rounded-3xl p-7 lg:min-w-[340px]">
              <VStack className="gap-3">
                <Text className="text-sanctuary-text-tertiary text-[10px] font-black uppercase tracking-[0.25em]">
                  Workspace frame
                </Text>
                <Text className="text-sanctuary-text text-sm font-bold leading-relaxed tracking-tight">
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
  resolvedSurfaces: ResolvedTeacherSurface[],
) {
  return definitions.reduce(
    (acc, definition) => {
      const resolved = resolvedSurfaces.find(
        (surface) => surface.surfaceId === definition.surfaceId,
      );
      acc[definition.surfaceId] = resolved ? { definition, surface: resolved } : null;
      return acc;
    },
    {
      'temporal-context': null,
      'primary-actions': null,
      'support-tools': null,
      pulse: null,
      'classroom-registry': null,
    } as Record<TeacherDashboardSurfaceId, SurfaceSlot>,
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
        return 'bg-sanctuary-text-tertiary/5 border-sanctuary-border text-sanctuary-text-tertiary';
      default:
        return 'bg-sanctuary-info/10 border-sanctuary-info/20 text-sanctuary-info';
    }
  }, [tone]);

  return (
    <Box className={`px-3 py-1.5 rounded-xl border ${badgeStyle}`}>
      <Text className="text-[10px] font-black tracking-[0.15em] uppercase inherit-color">
        {label}
      </Text>
    </Box>
  );
}

function HeroMetricCard({ label, value }: { label: string; value: string }) {
  return (
    <Box className="flex-1 min-w-[140px] px-6 py-6 rounded-[24px] border border-sanctuary-border bg-sanctuary-surface shadow-sm">
      <Text className="text-sanctuary-text-tertiary text-[10px] font-black uppercase tracking-[0.3em]">
        {label}
      </Text>
      <Text className="text-sanctuary-text text-3xl font-black mt-3 tracking-tighter">{value}</Text>
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
      className={`rounded-[32px] p-8 border border-sanctuary-border ${
        isPrimary ? 'bg-sanctuary-surface-secondary/40' : 'bg-sanctuary-surface'
      }`}
    >
      <VStack className="gap-7">
        <VStack className="gap-5">
          <HStack className="items-center justify-between gap-6">
            <VStack className="flex-1 gap-1.5">
              <Text className="text-sanctuary-text-tertiary text-[10px] font-black uppercase tracking-[0.3em]">
                {slot.definition.subtitle || 'Capability surface'}
              </Text>
              <Heading className="text-xl text-sanctuary-text font-black tracking-tight uppercase">
                {slot.definition.title}
              </Heading>
            </VStack>

            {slot.definition.temporalLabel ? (
              <Box className="px-3.5 py-2 rounded-xl bg-sanctuarySaffron/10 border border-sanctuarySaffron/20">
                <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-sanctuarySaffron">
                  {slot.definition.temporalLabel}
                </Text>
              </Box>
            ) : null}
          </HStack>

          {slot.definition.summary ? (
            <Text className="text-sanctuary-text text-sm leading-relaxed font-medium opacity-70">
              {slot.definition.summary}
            </Text>
          ) : null}

          {Array.isArray(slot.definition.metadata) && slot.definition.metadata.length > 0 ? (
            <HStack className="gap-2.5 flex-wrap">
              {slot.definition.metadata.map((item) => (
                <Box
                  key={item}
                  className="px-3 py-1.5 rounded-xl bg-sanctuary-surface-secondary border border-sanctuary-border"
                >
                  <Text className="text-[10px] font-black uppercase tracking-[0.15em] text-sanctuary-text-tertiary">
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
