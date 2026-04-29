import {
  type ResolvedWorkspaceSurface,
  WORKSPACE_CANVAS_ZONES,
  type WorkspaceZoneId,
} from '@repo/core';
import { Box, HStack, Text, WorkspaceCanvas } from '@repo/ui';
import { Pressable } from '@repo/ui/primitives';

import React from 'react';
import type {
  ClassroomWorkspaceCapabilityKey,
  ClassroomWorkspaceSurface,
  ClassroomWorkspaceSurfaceId,
} from '../types/workspace';

type ClassroomResolvedSurface = ClassroomWorkspaceSurface &
  ResolvedWorkspaceSurface<ClassroomWorkspaceSurfaceId, ClassroomWorkspaceCapabilityKey>;

type Props = {
  layout: {
    order: ClassroomWorkspaceSurfaceId[];
    hidden: ClassroomWorkspaceSurfaceId[];
    pinned: ClassroomWorkspaceSurfaceId[];
    zoneBySurface: Partial<Record<ClassroomWorkspaceSurfaceId, WorkspaceZoneId>>;
    workspaceId: string;
    userId: string;
    updatedAt: string;
  } | null;
  surfaces: ClassroomResolvedSurface[];
  onToggleHidden: (id: ClassroomWorkspaceSurfaceId, hidden: boolean) => void;
  onTogglePinned: (id: ClassroomWorkspaceSurfaceId, pinned: boolean) => void;
  onMoveToNextZone: (id: ClassroomWorkspaceSurfaceId, zone: WorkspaceZoneId) => void;
};

const getNextZone = (zone: WorkspaceZoneId): WorkspaceZoneId => {
  const currentIndex = WORKSPACE_CANVAS_ZONES.indexOf(zone);
  const nextIndex = (currentIndex + 1) % WORKSPACE_CANVAS_ZONES.length;
  return WORKSPACE_CANVAS_ZONES[nextIndex] as WorkspaceZoneId;
};

export function ClassroomWorkspaceCanvas({
  layout,
  surfaces,
  onToggleHidden,
  onTogglePinned,
  onMoveToNextZone,
}: Props) {
  if (!layout) return null;

  return (
    <WorkspaceCanvas
      surfaces={surfaces}
      layout={layout as any}
      title="Classroom Work Canvas"
      subtitle="Capability-driven workspace for academic, mixed-role, and institutional surfaces."
      emptyMessage="No workspace surfaces are available for this user yet."
      renderSurfaceContent={(surface) => {
        const typedSurface = surface as ClassroomResolvedSurface;
        return <Box className="flex-1">{typedSurface.content}</Box>;
      }}
      getSurfaceSubtitle={(surface) => (surface as ClassroomResolvedSurface).subtitle}
      getSurfaceSummary={(surface) => (surface as ClassroomResolvedSurface).summary}
      getSurfaceTemporalLabel={(surface) => (surface as ClassroomResolvedSurface).temporalLabel}
      getSurfaceMetadata={(surface) => (surface as ClassroomResolvedSurface).metadata}
      renderSurfaceActions={(surface) => {
        const typedSurface = surface as ClassroomResolvedSurface;
        const nextZone = getNextZone(typedSurface.zone);

        return (
          <HStack className="gap-2 flex-wrap">
            <Pressable
              accessibilityRole="button"
              onPress={() => onTogglePinned(typedSurface.surfaceId, !typedSurface.pinned)}
              className="bg-phase-surface-light border border-phase-border px-4 py-2 rounded-full active:opacity-70"
            >
              <Text className="text-xs font-semibold text-phaseText-primary">
                {typedSurface.pinned ? 'Unpin' : 'Pin'}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => onMoveToNextZone(typedSurface.surfaceId, nextZone)}
              className="bg-phase-surface-light border border-phase-border px-4 py-2 rounded-full active:opacity-70"
            >
              <Text className="text-xs font-semibold text-phaseText-primary">
                Move to {nextZone}
              </Text>
            </Pressable>
          </HStack>
        );
      }}
      onToggleHidden={(surface) => onToggleHidden(surface.surfaceId, !surface.hidden)}
    />
  );
}

export default ClassroomWorkspaceCanvas;
