import type {
  AreaId,
  ResolvedWorkspaceSurface,
  WorkspaceAppearance,
  WorkspaceFloorSettings,
  WorkspaceLayout,
  WorkspaceSurfaceDefinition,
} from '@repo/core/types';

export const DEFAULT_WORKSPACE_APPEARANCE: WorkspaceAppearance = {
  preset: 'default',
  motion: 'off',
};

/** Keep the canvas's high-attention layer within the dense-workspace limit. */
export const MAX_PINNED_WORKSPACE_SURFACES = 4;

export const PER_WORKSPACE_PIN_CAP: Record<string, number> = {
  'teacher-dashboard': 4,
  'student-dashboard': 2,
  'principal-workspace': 4,
  'founder-workspace': 4,
  'guardian-workspace': 2,
  'admin-workspace': 4,
  self: 2,
  library: 2,
  community: 0,
  profile: 3,
};

export function getMaxPinnedForWorkspace(workspaceId: string): number {
  return PER_WORKSPACE_PIN_CAP[workspaceId] ?? MAX_PINNED_WORKSPACE_SURFACES;
}

/**
 * The areas a room uses, in the order its furniture list first names them.
 * Areas belong to the room; core keeps no fixed list.
 */
export function areasOfSurfaces(
  surfaces: readonly Pick<WorkspaceSurfaceDefinition, 'defaultZone' | 'defaultOrder'>[],
): AreaId[] {
  const seen: AreaId[] = [];
  for (const s of [...surfaces].sort((a, b) => a.defaultOrder - b.defaultOrder)) {
    if (!seen.includes(s.defaultZone)) seen.push(s.defaultZone);
  }
  return seen;
}

/** The next area after `area` in a room's own area list, wrapping round. */
export function nextAreaOf(area: AreaId, areas: readonly AreaId[]): AreaId {
  if (areas.length === 0) return area;
  const i = areas.indexOf(area);
  return areas[(i + 1) % areas.length] as AreaId;
}

export interface WorkspaceZoneLayoutGroup<
  TSurfaceId extends string = string,
  TCapabilityKey extends string = string,
> {
  zone: AreaId;
  surfaces: ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>[];
}

const unique = <TValue>(values: TValue[]): TValue[] => Array.from(new Set(values));

/** Moves one declared group without changing its identity or any other group's order. */
export function moveWorkspaceGroup<TGroupId extends string>(
  groupOrder: readonly TGroupId[],
  groupId: TGroupId,
  direction: 'up' | 'down',
): TGroupId[] {
  const index = groupOrder.indexOf(groupId);
  const target = direction === 'up' ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= groupOrder.length) return [...groupOrder];

  const next = [...groupOrder];
  const current = next[index];
  const destination = next[target];
  if (current === undefined || destination === undefined) return next;
  next[index] = destination;
  next[target] = current;
  return next;
}

export function resolveWorkspaceGroupOrder<TGroupId extends string>(
  stored: readonly string[] | undefined,
  defaults: readonly TGroupId[],
): TGroupId[] {
  const allowed = new Set(defaults);
  const selected = (stored ?? []).filter((groupId): groupId is TGroupId =>
    allowed.has(groupId as TGroupId),
  );
  return unique([...selected, ...defaults.filter((groupId) => !selected.includes(groupId))]);
}

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
  const zoneBySurface = orderedSurfaceIds.reduce<Partial<Record<TSurfaceId, AreaId>>>(
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
    isDefault: true,
    surfaceMetadata: {},
    appearance: DEFAULT_WORKSPACE_APPEARANCE,
    updatedAt,
  };
}

export function normalizeWorkspaceLayout<TSurfaceId extends string, TCapabilityKey extends string>(
  layout: WorkspaceLayout<TSurfaceId>,
  surfaces: WorkspaceSurfaceDefinition<TSurfaceId, TCapabilityKey>[],
  updatedAt = layout.updatedAt,
): WorkspaceLayout<TSurfaceId> {
  // v1 -> v2 migration: backfill isDefault / surfaceMetadata if missing
  const migratedIsDefault = (layout as unknown as { isDefault?: boolean }).isDefault ?? true;
  const migratedMetadata =
    (layout as unknown as { surfaceMetadata?: Record<string, unknown> }).surfaceMetadata ?? {};
  const appearance = layout.appearance ?? DEFAULT_WORKSPACE_APPEARANCE;

  // Some platform adapters persist a floor preference before their domain
  // registry is hydrated. Preserve the stored arrangement until definitions
  // are available instead of treating the empty registry as authoritative.
  if (surfaces.length === 0) {
    return {
      ...layout,
      isDefault: migratedIsDefault,
      surfaceMetadata: migratedMetadata,
      appearance,
      groupOrder: layout.groupOrder ? unique(layout.groupOrder) : undefined,
      updatedAt,
    };
  }
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
    .slice(0, getMaxPinnedForWorkspace(layout.workspaceId));

  const zoneBySurface = defaultOrder.reduce<Partial<Record<TSurfaceId, AreaId>>>(
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
    groupOrder: layout.groupOrder ? unique(layout.groupOrder) : undefined,
    isDefault: migratedIsDefault,
    surfaceMetadata: migratedMetadata,
    appearance,
    ...(layout.floor ? { floor: layout.floor } : {}),
    updatedAt,
  };
}

/** Saves the person's floor settings on a layout (see logic/floor/settings.ts). */
export function setWorkspaceFloorSettings<TSurfaceId extends string>(
  layout: WorkspaceLayout<TSurfaceId>,
  floor: WorkspaceFloorSettings,
  updatedAt: string,
): WorkspaceLayout<TSurfaceId> {
  return { ...layout, floor, isDefault: false, updatedAt };
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
    zoneOrder?: readonly AreaId[];
  } = {},
): WorkspaceZoneLayoutGroup<TSurfaceId, TCapabilityKey>[] {
  const { includeHidden = false, zoneOrder = [] } = options;
  const grouped = new Map<AreaId, ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>[]>();

  for (const zone of zoneOrder) {
    grouped.set(zone, []);
  }

  // Every area a surface sits in gets a group, even when all its surfaces are
  // hidden, so a room's areas stay put; the room's own order comes first.
  for (const surface of surfaces) {
    if (!grouped.has(surface.zone)) grouped.set(surface.zone, []);
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
    isDefault: false,
    updatedAt,
  };
}

export function setWorkspaceGroupOrder<TSurfaceId extends string>(
  layout: WorkspaceLayout<TSurfaceId>,
  groupOrder: string[],
  updatedAt = new Date().toISOString(),
): WorkspaceLayout<TSurfaceId> {
  return {
    ...layout,
    groupOrder: unique(groupOrder),
    isDefault: false,
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
    isDefault: false,
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
    if (currentPinned.length >= getMaxPinnedForWorkspace(layout.workspaceId)) return layout;
    return {
      ...layout,
      pinned: [...currentPinned, surfaceId],
      isDefault: false,
      updatedAt,
    };
  }

  return {
    ...layout,
    pinned: pinned ? currentPinned : currentPinned.filter((candidate) => candidate !== surfaceId),
    isDefault: false,
    updatedAt,
  };
}

export function setWorkspaceSurfaceZone<TSurfaceId extends string>(
  layout: WorkspaceLayout<TSurfaceId>,
  surfaceId: TSurfaceId,
  zone: AreaId,
  updatedAt = new Date().toISOString(),
): WorkspaceLayout<TSurfaceId> {
  return {
    ...layout,
    zoneBySurface: {
      ...layout.zoneBySurface,
      [surfaceId]: zone,
    },
    isDefault: false,
    updatedAt,
  };
}

export function resetWorkspaceLayoutToDefault<TSurfaceId extends string>(
  layout: WorkspaceLayout<TSurfaceId>,
  updatedAt = new Date().toISOString(),
): WorkspaceLayout<TSurfaceId> {
  return { ...layout, groupOrder: undefined, isDefault: true, updatedAt };
}

export function setWorkspaceAppearance<TSurfaceId extends string>(
  layout: WorkspaceLayout<TSurfaceId>,
  appearance: WorkspaceAppearance,
  updatedAt = new Date().toISOString(),
): WorkspaceLayout<TSurfaceId> {
  return {
    ...layout,
    appearance,
    isDefault: false,
    updatedAt,
  };
}

export function resetWorkspaceAppearance<TSurfaceId extends string>(
  layout: WorkspaceLayout<TSurfaceId>,
  updatedAt = new Date().toISOString(),
): WorkspaceLayout<TSurfaceId> {
  return {
    ...layout,
    appearance: DEFAULT_WORKSPACE_APPEARANCE,
    updatedAt,
  };
}
