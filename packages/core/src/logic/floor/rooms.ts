import type { FeaturePresentationMode } from '@repo/core/logic/permissions/featurePresentation';
import type { DomainEntry, TabDomain } from '@repo/core/logic/registry/domainEntry';
import { catalogRoleOf } from '@repo/core/logic/workspace/roomName';
import type { WorkspaceLayout } from '@repo/core/types';
import { groupsWithSavedOrder, piecesFromLayout } from './bridge';
import type { FloorConfig } from './config';
import type { FloorInput } from './layout';
import type {
  AreaInput,
  FloorControls,
  FloorFit,
  FloorSpace,
  GroupInput,
  WorldFloorBias,
} from './types';

/**
 * Each room's floor reads its features from the room's catalog (the
 * AppCatalog entries for that tab). The catalog says what exists, for which
 * roles, and where each feature starts; SanctuaryFeature says whether the
 * person may have it; the person's saved arrangement moves, hides and pins.
 * The only thing kept per room here is the floor's zones and groups.
 */
export interface RoomFloorParts {
  zones: readonly AreaInput[];
  groups: readonly GroupInput[];
}

const TODAY: AreaInput = { id: 'today', label: 'Today', smart: true };

export const ROOM_FLOORS: Readonly<Record<TabDomain, RoomFloorParts>> = {
  self: {
    zones: [TODAY, { id: 'private', label: 'Just you' }],
    groups: [
      { id: 'today', label: 'Today', area: 'today', job: 'act' },
      { id: 'grow', label: 'Growing', area: 'private', job: 'glance' },
      { id: 'care', label: 'Care', area: 'private', job: 'glance' },
      { id: 'work-life', label: 'Work and you', area: 'private', job: 'glance' },
    ],
  },
  workspace: {
    zones: [TODAY, { id: 'work', label: 'Work' }, { id: 'institution', label: 'School' }],
    groups: [
      { id: 'today', label: 'Today', area: 'today', job: 'act' },
      { id: 'academics', label: 'Teaching and learning', area: 'work', job: 'browse' },
      { id: 'operations', label: 'Daily running', area: 'work', job: 'glance' },
      { id: 'communications', label: 'Notices and messages', area: 'institution', job: 'glance' },
      { id: 'institutional', label: 'School', area: 'institution', job: 'glance' },
    ],
  },
  community: {
    zones: [TODAY, { id: 'work', label: 'Together' }],
    groups: [
      { id: 'news', label: 'New for you', area: 'today', job: 'glance' },
      { id: 'talk', label: 'Talk', area: 'work', job: 'act' },
      { id: 'groups', label: 'Groups', area: 'work', job: 'browse' },
    ],
  },
  library: {
    zones: [{ id: 'work', label: 'Shelves' }],
    groups: [{ id: 'shelves', label: 'Shelves', area: 'work', job: 'browse' }],
  },
  profile: { zones: [], groups: [] },
};

/** One room's catalog as one role sees it on one platform. */
export interface RoomCatalog {
  room: TabDomain;
  role: string;
  zones: readonly AreaInput[];
  groups: readonly GroupInput[];
  /** Furniture: the entries with a floor place, in default order. */
  features: readonly DomainEntry[];
}

export type CatalogPlatform = 'web' | 'mobile';

/**
 * Whether an entry is offered to this role (roles missing = every role).
 * With no capacity at all, every entry is offered (the full room list).
 */
export function entryForRole(entry: DomainEntry, capacity: string | null | undefined): boolean {
  if (!entry.roles || entry.common || !capacity) return true;
  const role = catalogRoleOf(capacity);
  return entry.roles.includes(role) || entry.roles.includes(capacity);
}

function onPlatform(entry: DomainEntry, platform: CatalogPlatform): boolean {
  return platform === 'web' ? entry.webSupport : entry.mobileSupport;
}

/** A room's features for one role and platform, from the catalog. */
export function roomFeatures(
  catalog: Readonly<Record<string, DomainEntry>> | readonly DomainEntry[],
  room: TabDomain,
  capacity: string | null | undefined,
  platform: CatalogPlatform,
): DomainEntry[] {
  const entries = Array.isArray(catalog) ? catalog : Object.values(catalog);
  return entries
    .filter(
      (e) =>
        e.tabDomain === room &&
        e.floor &&
        e.state !== 'development' &&
        e.state !== 'deprecated' &&
        onPlatform(e, platform) &&
        entryForRole(e, capacity),
    )
    .sort((a, b) => a.defaultOrder - b.defaultOrder);
}

/** The room's catalog for one role: its zones, the groups in use, and its features. */
export function roomCatalogOf(
  catalog: Readonly<Record<string, DomainEntry>> | readonly DomainEntry[],
  room: TabDomain,
  capacity: string | null | undefined,
  platform: CatalogPlatform,
): RoomCatalog {
  const features = roomFeatures(catalog, room, capacity, platform);
  const parts = ROOM_FLOORS[room];
  const used = new Set(features.map((f) => f.floor!.group));
  const groups = parts.groups.filter((g) => used.has(g.id));
  const zonesUsed = new Set(groups.map((g) => g.area));
  return {
    room,
    role: catalogRoleOf(capacity),
    zones: parts.zones.filter((z) => zonesUsed.has(z.id)),
    groups,
    features,
  };
}

function zoneOf(entry: DomainEntry, parts: RoomFloorParts): string {
  const group = parts.groups.find((g) => g.id === entry.floor?.group);
  return entry.defaultZone ?? group?.area ?? parts.zones[0]?.id ?? 'today';
}

export interface RoomFloorOptions {
  catalog: RoomCatalog;
  /** SanctuaryFeature's decision per feature id; missing means available. */
  presentationOf?: (featureId: string) => FeaturePresentationMode;
  /** The kit's fit for a component name (floorFitOf in the kit). */
  fitOf: (shape: string) => FloorFit;
  layout?: Pick<
    WorkspaceLayout,
    'order' | 'hidden' | 'pinned' | 'zoneBySurface' | 'groupOrder'
  > | null;
  space: FloorSpace;
  controls: FloorControls;
  world?: WorldFloorBias;
  config?: Partial<FloorConfig>;
}

/** The engine's input for one room, as one person in one bond sees it now. */
export function roomFloorInput({
  catalog,
  presentationOf = () => 'available',
  fitOf,
  layout = null,
  space,
  controls,
  world,
  config,
}: RoomFloorOptions): FloorInput {
  const parts = ROOM_FLOORS[catalog.room];
  const { pieces } = piecesFromLayout(
    catalog.features.map((f) => ({
      id: f.id,
      label: f.label,
      group: f.floor!.group,
      defaultArea: zoneOf(f, parts),
      presentation: presentationOf(f.id),
      fit: fitOf(f.floor!.shape),
      time: f.floor!.urgency,
      task: f.floor!.task,
      lit: f.floor!.lit,
      needsAttention: f.floor!.needsAttention,
      roleImportance: f.floor!.weight,
    })),
    layout,
  );
  return {
    room: catalog.room,
    areas: catalog.zones,
    groups: groupsWithSavedOrder(catalog.groups, layout?.groupOrder),
    pieces,
    space,
    controls,
    world,
    config,
  };
}

/**
 * The room's features as layout-sync surfaces, so the person's saved order,
 * pins and hidden features apply to them.
 */
export function roomSurfaceDefinitions(catalog: RoomCatalog, workspaceId: string) {
  const parts = ROOM_FLOORS[catalog.room];
  return catalog.features.map((f) => ({
    surfaceId: f.id,
    workspaceId,
    capabilityKey: f.id,
    ownerPackage: 'core' as const,
    defaultZone: zoneOf(f, parts),
    defaultOrder: f.defaultOrder,
    title: f.label,
    groupId: f.floor!.group,
    mobileSupport: f.mobileSupport,
    webSupport: f.webSupport,
  }));
}
