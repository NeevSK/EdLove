import {
  normalizeWorkspaceLayout,
  resolveWorkspaceSurfaceLayout,
} from '@repo/core/logic/workspace/canvas';
import type {
  ResolvedWorkspaceSurface,
  WorkspaceLayout,
  WorkspaceSurfaceDefinition,
} from '@repo/core/types';

/**
 * A domain floor describes how that domain reads the shared layout model. It
 * deliberately owns grouping and labels; the workspace renderer's zone deck
 * is not a visual default for Self, Library, Community, or Profile.
 */
export interface DomainCanvasSemantics<
  TSurfaceId extends string,
  TCapabilityKey extends string,
  TGroupId extends string,
> {
  readonly groupOrder: readonly TGroupId[];
  getGroupId: (surface: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>) => TGroupId;
  getGroupLabel: (groupId: TGroupId) => string;
  includeHidden?: boolean;
}

export interface DomainCanvasGroup<
  TSurfaceId extends string,
  TCapabilityKey extends string,
  TGroupId extends string,
> {
  id: TGroupId;
  label: string;
  surfaces: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>[];
}

export interface DomainCanvasState<
  TSurfaceId extends string,
  TCapabilityKey extends string,
  TGroupId extends string,
> {
  layout: WorkspaceLayout<TSurfaceId>;
  surfaces: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>[];
  groups: DomainCanvasGroup<TSurfaceId, TCapabilityKey, TGroupId>[];
  visibleSurfaceCount: number;
  pinnedSurfaceCount: number;
}

export function resolveDomainCanvasState<
  TSurfaceId extends string,
  TCapabilityKey extends string,
  TGroupId extends string,
  TDefinition extends WorkspaceSurfaceDefinition<
    TSurfaceId,
    TCapabilityKey
  > = WorkspaceSurfaceDefinition<TSurfaceId, TCapabilityKey>,
>({
  surfaces: definitions,
  layout,
  semantics,
}: {
  surfaces: TDefinition[];
  layout: WorkspaceLayout<TSurfaceId>;
  semantics: DomainCanvasSemantics<TSurfaceId, TCapabilityKey, TGroupId>;
}): DomainCanvasState<TSurfaceId, TCapabilityKey, TGroupId> {
  const normalizedLayout = normalizeWorkspaceLayout(layout, definitions);
  const surfaces = resolveWorkspaceSurfaceLayout(definitions, normalizedLayout);
  const includedSurfaces = semantics.includeHidden
    ? surfaces
    : surfaces.filter((surface) => !surface.hidden);
  const groups = createDomainCanvasGroups(includedSurfaces, semantics);

  return {
    layout: normalizedLayout,
    surfaces,
    groups,
    visibleSurfaceCount: surfaces.filter((surface) => !surface.hidden).length,
    pinnedSurfaceCount: includedSurfaces.filter((surface) => surface.pinned).length,
  };
}

function createDomainCanvasGroups<
  TSurfaceId extends string,
  TCapabilityKey extends string,
  TGroupId extends string,
>(
  surfaces: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>[],
  semantics: DomainCanvasSemantics<TSurfaceId, TCapabilityKey, TGroupId>,
): DomainCanvasGroup<TSurfaceId, TCapabilityKey, TGroupId>[] {
  const groups = new Map<TGroupId, ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>[]>();

  for (const groupId of semantics.groupOrder) {
    groups.set(groupId, []);
  }

  for (const surface of surfaces) {
    const groupId = semantics.getGroupId(surface);
    const group = groups.get(groupId);

    if (!group) {
      throw new Error(
        `Domain canvas semantics returned undeclared group "${groupId}" for surface "${surface.surfaceId}".`,
      );
    }

    group.push(surface);
  }

  return semantics.groupOrder.map((groupId) => ({
    id: groupId,
    label: semantics.getGroupLabel(groupId),
    surfaces: groups.get(groupId) ?? [],
  }));
}
