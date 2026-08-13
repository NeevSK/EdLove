import type {
  ResolvedWorkspaceSurface,
  WorkspaceLayout,
  WorkspaceSurfaceDefinition,
  WorkspaceZoneId,
} from '@repo/core/types';

export const WORKSPACE_CANVAS_ZONES = [
  'today',
  'work',
  'institution',
  'outlook',
  'private',
] as const satisfies readonly WorkspaceZoneId[];

/** Keep the canvas's high-attention layer within the dense-workspace limit. */
export const MAX_PINNED_WORKSPACE_SURFACES = 4;

export type WorkspaceCanvasZoneId = (typeof WORKSPACE_CANVAS_ZONES)[number];

export interface WorkspaceZoneLayoutGroup<
  TSurfaceId extends string = string,
  TCapabilityKey extends string = string,
> {
  zone: WorkspaceZoneId;
  surfaces: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>[];
}

const unique = <TValue>(values: TValue[]): TValue[] => Array.from(new Set(values));

const toSurfaceMap = <TSurfaceId extends string, TCapabilityKey extends string>(
  surfaces: WorkspaceSurfaceDefinition<TSurfaceId, TCapabilityKey>[],
) => new Map(surfaces.map((surface) => [surface.surfaceId, surface]));

const sortSurfaceIdsByDefault = <TSurfaceId extends string, TCapabilityKey extends string>(
  surfaces: WorkspaceSurfaceDefinition<TSurfaceId, TCapabilityKey>[],
): TSurfaceId[] =>
  [...surfaces]
    .sort((left, right) => {
      if (left.defaultOrder !== right.defaultOrder) {
        return left.defaultOrder - right.defaultOrder;
      }

      return left.surfaceId.localeCompare(right.surfaceId);
    })
    .map((surface) => surface.surfaceId);

export function createDefaultWorkspaceLayout<
  TSurfaceId extends string,
  TCapabilityKey extends string,
>({
  workspaceId,
  userId,
  surfaces,
  updatedAt = new Date().toISOString(),
}: {
  workspaceId: string;
  userId: string;
  surfaces: WorkspaceSurfaceDefinition<TSurfaceId, TCapabilityKey>[];
  updatedAt?: string;
}): WorkspaceLayout<TSurfaceId> {
  const orderedSurfaceIds = sortSurfaceIdsByDefault(surfaces);
  const hidden = surfaces
    .filter((surface) => surface.hiddenByDefault)
    .map((surface) => surface.surfaceId);
  const zoneBySurface = orderedSurfaceIds.reduce<Partial<Record<TSurfaceId, WorkspaceZoneId>>>(
    (zones, surfaceId) => {
      const surface = surfaces.find((candidate) => candidate.surfaceId === surfaceId);
      if (surface) {
        zones[surfaceId] = surface.defaultZone;
      }

      return zones;
    },
    {},
  );

  return {
    workspaceId,
    userId,
    order: orderedSurfaceIds,
    hidden,
    pinned: [],
    zoneBySurface,
    updatedAt,
  };
}

export function normalizeWorkspaceLayout<TSurfaceId extends string, TCapabilityKey extends string>(
  layout: WorkspaceLayout<TSurfaceId>,
  surfaces: WorkspaceSurfaceDefinition<TSurfaceId, TCapabilityKey>[],
  updatedAt = layout.updatedAt,
): WorkspaceLayout<TSurfaceId> {
  const surfaceMap = toSurfaceMap(surfaces);
  const defaultOrder = sortSurfaceIdsByDefault(surfaces);
  const remainingSurfaceIds = new Set(defaultOrder);
  const order = unique(layout.order).filter((surfaceId) => {
    const exists = remainingSurfaceIds.has(surfaceId);
    if (exists) {
      remainingSurfaceIds.delete(surfaceId);
    }

    return exists;
  });

  order.push(...defaultOrder.filter((surfaceId) => remainingSurfaceIds.has(surfaceId)));

  const hiddenByDefault = surfaces
    .filter((surface) => surface.hiddenByDefault)
    .map((surface) => surface.surfaceId);

  const hidden = unique([...layout.hidden, ...hiddenByDefault]).filter((surfaceId) =>
    surfaceMap.has(surfaceId),
  );

  const pinned = unique(layout.pinned)
    .filter((surfaceId) => surfaceMap.has(surfaceId))
    .slice(0, MAX_PINNED_WORKSPACE_SURFACES);

  const zoneBySurface = defaultOrder.reduce<Partial<Record<TSurfaceId, WorkspaceZoneId>>>(
    (zones, surfaceId) => {
      const surface = surfaceMap.get(surfaceId);
      if (!surface) return zones;

      zones[surfaceId] = layout.zoneBySurface[surfaceId] ?? surface.defaultZone;
      return zones;
    },
    {},
  );

  return {
    workspaceId: layout.workspaceId,
    userId: layout.userId,
    order,
    hidden,
    pinned,
    zoneBySurface,
    updatedAt,
  };
}

export function resolveWorkspaceSurfaceLayout<
  TSurfaceId extends string,
  TCapabilityKey extends string,
  TDefinition extends WorkspaceSurfaceDefinition<
    TSurfaceId,
    TCapabilityKey
  > = WorkspaceSurfaceDefinition<TSurfaceId, TCapabilityKey>,
>(
  surfaces: TDefinition[],
  layout: WorkspaceLayout<TSurfaceId>,
): (TDefinition & ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>)[] {
  const normalized = normalizeWorkspaceLayout(layout, surfaces);
  const ranked = new Map(normalized.order.map((surfaceId, index) => [surfaceId, index]));
  const hidden = new Set(normalized.hidden);
  const pinned = new Set(normalized.pinned);

  return [...surfaces]
    .map((surface) => ({
      ...surface,
      title: surface.title ?? surface.surfaceId,
      hidden: hidden.has(surface.surfaceId),
      pinned: pinned.has(surface.surfaceId),
      zone: normalized.zoneBySurface[surface.surfaceId] ?? surface.defaultZone,
      order: ranked.get(surface.surfaceId) ?? Number.MAX_SAFE_INTEGER,
    }))
    .sort((left, right) => {
      if (left.order !== right.order) {
        return left.order - right.order;
      }

      if (left.defaultOrder !== right.defaultOrder) {
        return left.defaultOrder - right.defaultOrder;
      }

      return left.surfaceId.localeCompare(right.surfaceId);
    });
}

export function groupResolvedWorkspaceSurfacesByZone<
  TSurfaceId extends string,
  TCapabilityKey extends string,
>(
  surfaces: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>[],
  options: {
    includeHidden?: boolean;
    zoneOrder?: readonly WorkspaceZoneId[];
  } = {},
): WorkspaceZoneLayoutGroup<TSurfaceId, TCapabilityKey>[] {
  const { includeHidden = false, zoneOrder = WORKSPACE_CANVAS_ZONES } = options;
  const grouped = new Map<
    WorkspaceZoneId,
    ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>[]
  >();

  for (const zone of zoneOrder) {
    grouped.set(zone, []);
  }

  for (const surface of surfaces) {
    if (!includeHidden && surface.hidden) {
      continue;
    }

    const bucket = grouped.get(surface.zone) ?? [];
    bucket.push(surface);
    grouped.set(surface.zone, bucket);
  }

  return [...grouped.entries()].map(([zone, zoneSurfaces]) => ({
    zone,
    surfaces: zoneSurfaces.sort((left, right) => left.order - right.order),
  }));
}

export function setWorkspaceSurfaceOrder<TSurfaceId extends string>(
  layout: WorkspaceLayout<TSurfaceId>,
  order: TSurfaceId[],
  updatedAt = new Date().toISOString(),
): WorkspaceLayout<TSurfaceId> {
  return {
    ...layout,
    order: unique(order),
    updatedAt,
  };
}

export function setWorkspaceSurfaceHidden<TSurfaceId extends string>(
  layout: WorkspaceLayout<TSurfaceId>,
  surfaceId: TSurfaceId,
  hidden: boolean,
  updatedAt = new Date().toISOString(),
): WorkspaceLayout<TSurfaceId> {
  return {
    ...layout,
    hidden: hidden
      ? unique([...layout.hidden, surfaceId])
      : layout.hidden.filter((candidate) => candidate !== surfaceId),
    updatedAt,
  };
}

export function setWorkspaceSurfacePinned<TSurfaceId extends string>(
  layout: WorkspaceLayout<TSurfaceId>,
  surfaceId: TSurfaceId,
  pinned: boolean,
  updatedAt = new Date().toISOString(),
): WorkspaceLayout<TSurfaceId> {
  const currentPinned = unique(layout.pinned);
  if (pinned && !currentPinned.includes(surfaceId)) {
    if (currentPinned.length >= MAX_PINNED_WORKSPACE_SURFACES) return layout;
    return {
      ...layout,
      pinned: [...currentPinned, surfaceId],
      updatedAt,
    };
  }

  return {
    ...layout,
    pinned: pinned
      ? currentPinned
      : currentPinned.filter((candidate) => candidate !== surfaceId),
    updatedAt,
  };
}

export function setWorkspaceSurfaceZone<TSurfaceId extends string>(
  layout: WorkspaceLayout<TSurfaceId>,
  surfaceId: TSurfaceId,
  zone: WorkspaceZoneId,
  updatedAt = new Date().toISOString(),
): WorkspaceLayout<TSurfaceId> {
  return {
    ...layout,
    zoneBySurface: {
      ...layout.zoneBySurface,
      [surfaceId]: zone,
    },
    updatedAt,
  };
}
