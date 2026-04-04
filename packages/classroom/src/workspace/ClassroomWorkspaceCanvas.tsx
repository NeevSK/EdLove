import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import {
    WORKSPACE_CANVAS_ZONES,
    type WorkspaceZoneId,
    type ResolvedWorkspaceSurface,
} from '@repo/core';
import { Box, Theme, Text, WorkspaceCanvas } from '@repo/ui';
import type {
    ClassroomWorkspaceSurface,
    ClassroomWorkspaceSurfaceId,
    ClassroomWorkspaceCapabilityKey,
} from './useClassroomWorkspaceSurfaces';

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

    const styles = createStyles();

    return (
        <WorkspaceCanvas
            surfaces={surfaces}
            layout={layout as any}
            title="Classroom Work Canvas"
            subtitle="Capability-driven workspace for academic, mixed-role, and institutional surfaces."
            emptyMessage="No workspace surfaces are available for this user yet."
            renderSurfaceContent={(surface) => {
                const typedSurface = surface as ClassroomResolvedSurface;
                return <Box sx={{ flex: 1 }}>{typedSurface.content}</Box>;
            }}
            getSurfaceSubtitle={(surface) => (surface as ClassroomResolvedSurface).subtitle}
            getSurfaceSummary={(surface) => (surface as ClassroomResolvedSurface).summary}
            getSurfaceTemporalLabel={(surface) => (surface as ClassroomResolvedSurface).temporalLabel}
            getSurfaceMetadata={(surface) => (surface as ClassroomResolvedSurface).metadata}
            renderSurfaceActions={(surface) => {
                const typedSurface = surface as ClassroomResolvedSurface;
                const nextZone = getNextZone(typedSurface.zone);

                return (
                    <View style={styles.actionsRow}>
                        <Pressable
                            accessibilityRole="button"
                            onPress={() => onTogglePinned(typedSurface.surfaceId, !typedSurface.pinned)}
                            style={({ pressed }) => [styles.actionButton, pressed ? styles.actionButtonPressed : null]}
                        >
                            <Text style={styles.actionText}>
                                {typedSurface.pinned ? 'Unpin' : 'Pin'}
                            </Text>
                        </Pressable>
                        <Pressable
                            accessibilityRole="button"
                            onPress={() => onMoveToNextZone(typedSurface.surfaceId, nextZone)}
                            style={({ pressed }) => [styles.actionButton, pressed ? styles.actionButtonPressed : null]}
                        >
                            <Text style={styles.actionText}>Move to {nextZone}</Text>
                        </Pressable>
                    </View>
                );
            }}
            onToggleHidden={(surface) => onToggleHidden(surface.surfaceId, !surface.hidden)}
        />
    );
}

function createStyles() {
    return StyleSheet.create({
        actionsRow: {
            flexDirection: 'row',
            gap: Theme.spacing.sm,
            flexWrap: 'wrap',
        },
        actionButton: {
            borderRadius: Theme.corners.full,
            paddingHorizontal: Theme.spacing.md,
            paddingVertical: Theme.spacing.sm,
            backgroundColor: 'rgba(42, 35, 24, 0.06)',
            borderWidth: 1,
            borderColor: 'rgba(42, 35, 24, 0.08)',
        },
        actionButtonPressed: {
            opacity: 0.8,
        },
        actionText: {
            fontSize: Theme.typography.fontSize.sm,
            fontWeight: '600',
            color: Theme.colors.inkTruth,
        },
    });
}

export default ClassroomWorkspaceCanvas;
