import { useMemo } from 'react';
import {
    useWorkspaceLayoutSync,
    type ResolvedWorkspaceSurface,
} from '@repo/core';
import type { ClassroomWorkspaceSurface, ClassroomWorkspaceSurfaceId } from './useClassroomWorkspaceSurfaces';

export function useClassroomWorkspaceLayout(
    userId: string | null | undefined,
    surfaces: ClassroomWorkspaceSurface[]
) {
    const workspace = useWorkspaceLayoutSync({
        workspaceId: 'classroom',
        userId,
        surfaces,
    });

    const resolvedSurfaceMap = useMemo(
        () =>
            new Map(
                workspace.surfaces.map((surface) => [surface.surfaceId, surface] as const)
            ),
        [workspace.surfaces]
    );

    const enrichedSurfaces = useMemo(
        () =>
            surfaces
                .map((surface) => {
                    const resolved = resolvedSurfaceMap.get(surface.surfaceId);
                    if (!resolved) return null;

                    return {
                        ...surface,
                        ...resolved,
                    } as ClassroomWorkspaceSurface &
                        ResolvedWorkspaceSurface<ClassroomWorkspaceSurfaceId>;
                })
                .filter(Boolean) as Array<
                ClassroomWorkspaceSurface & ResolvedWorkspaceSurface<ClassroomWorkspaceSurfaceId>
            >,
        [surfaces, resolvedSurfaceMap]
    );

    return {
        ...workspace,
        surfaces: enrichedSurfaces,
    };
}
