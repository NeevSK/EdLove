import type { WorkspaceSurfaceDefinition } from '@repo/core/types';

export function createTeacherClassroomWorkspaceSurfaces(
  workspaceId: string,
): WorkspaceSurfaceDefinition[] {
  return [
    {
      surfaceId: 'subject',
      workspaceId,
      capabilityKey: 'core.identity',
      ownerPackage: 'classroom',
      defaultZone: 'work',
      defaultOrder: 0,
      title: 'Class Subject',
    },
    {
      surfaceId: 'lane',
      workspaceId,
      capabilityKey: 'core.navigation',
      ownerPackage: 'classroom',
      defaultZone: 'today',
      defaultOrder: 1,
      title: 'Active Lane',
    },
    {
      surfaceId: 'signals',
      workspaceId,
      capabilityKey: 'core.insights',
      ownerPackage: 'classroom',
      defaultZone: 'today',
      defaultOrder: 2,
      title: 'Growth Signals',
    },
  ];
}
