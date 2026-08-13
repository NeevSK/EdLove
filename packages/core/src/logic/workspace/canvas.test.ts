import { describe, expect, it } from 'vitest';
import {
  MAX_PINNED_WORKSPACE_SURFACES,
  createDefaultWorkspaceLayout,
  normalizeWorkspaceLayout,
  setWorkspaceSurfacePinned,
} from '@repo/core/logic/workspace/canvas';
import type { WorkspaceSurfaceDefinition } from '@repo/core/types';

type SurfaceId = `surface-${number}`;

const surfaces: WorkspaceSurfaceDefinition<SurfaceId, 'capability'>[] = Array.from(
  { length: 5 },
  (_, index) => ({
    surfaceId: `surface-${index + 1}` as SurfaceId,
    workspaceId: 'classroom',
    capabilityKey: 'capability',
    ownerPackage: 'classroom',
    defaultZone: 'work',
    defaultOrder: index,
  }),
);

describe('workspace canvas guardrails', () => {
  it('caps pinned surfaces while preserving the first four choices', () => {
    let layout = createDefaultWorkspaceLayout({
      workspaceId: 'classroom',
      userId: 'user-1',
      surfaces,
    });

    for (const surface of surfaces) {
      layout = setWorkspaceSurfacePinned(layout, surface.surfaceId, true);
    }

    expect(layout.pinned).toHaveLength(MAX_PINNED_WORKSPACE_SURFACES);
    expect(layout.pinned).toEqual(['surface-1', 'surface-2', 'surface-3', 'surface-4']);
  });

  it('normalizes legacy layouts that contain too many pins', () => {
    const layout = normalizeWorkspaceLayout(
      {
        ...createDefaultWorkspaceLayout({ workspaceId: 'classroom', userId: 'user-1', surfaces }),
        pinned: surfaces.map((surface) => surface.surfaceId),
      },
      surfaces,
    );

    expect(layout.pinned).toHaveLength(MAX_PINNED_WORKSPACE_SURFACES);
  });
});
