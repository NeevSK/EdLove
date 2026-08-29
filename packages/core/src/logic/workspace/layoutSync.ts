import type { WorkspaceLayout } from '@repo/core/types';
import type {
  WorkspaceLayoutRecord,
  WorkspaceLayoutTarget,
  WorkspaceLayoutUpsert,
} from '@repo/core/logic/schemas/workspace-layout.schema';

export type WorkspaceLayoutPlatformKind = 'web' | 'native';
export type WorkspaceLayoutScreenClass = 'compact' | 'expanded';

export interface WorkspaceLayoutSyncIdentity {
  userId: string;
  workspaceId: string;
  layoutTarget: WorkspaceLayoutTarget;
}

export interface WorkspaceLayoutSyncSnapshot<TSurfaceId extends string = string> {
  local: WorkspaceLayout<TSurfaceId> | null;
  remote: WorkspaceLayout<TSurfaceId> | null;
}

export function resolveWorkspaceLayoutTarget(
  platform: WorkspaceLayoutPlatformKind,
  screenClass: WorkspaceLayoutScreenClass = 'expanded',
): WorkspaceLayoutTarget {
  if (platform === 'web' && screenClass === 'expanded') {
    return 'web';
  }

  if (platform === 'native' || screenClass === 'compact') {
    return 'mobile';
  }

  return 'shared';
}

export function buildWorkspaceLayoutStorageKey({
  userId,
  workspaceId,
  layoutTarget,
}: WorkspaceLayoutSyncIdentity): string {
  return `workspace-layout:${workspaceId}:${layoutTarget}:${userId}`;
}

export function toWorkspaceLayoutRecord<TSurfaceId extends string = string>(
  record: WorkspaceLayoutRecord,
): WorkspaceLayout<TSurfaceId> {
  return {
    workspaceId: record.workspace_id,
    userId: record.user_id,
    order: record.order as TSurfaceId[],
    hidden: record.hidden as TSurfaceId[],
    pinned: record.pinned as TSurfaceId[],
    zoneBySurface: record.zone_by_surface as Partial<
      Record<TSurfaceId, WorkspaceLayout<TSurfaceId>['zoneBySurface'][TSurfaceId]>
    >,
    isDefault: record.is_default ?? true,
    surfaceMetadata: (record.surface_metadata as WorkspaceLayout<TSurfaceId>['surfaceMetadata']) ?? {},
    updatedAt: record.updated_at,
  };
}

export function toWorkspaceLayoutUpsert<TSurfaceId extends string = string>(
  layout: WorkspaceLayout<TSurfaceId>,
  identity: WorkspaceLayoutSyncIdentity,
): WorkspaceLayoutUpsert {
  return {
    userId: identity.userId,
    workspaceId: identity.workspaceId,
    layoutTarget: identity.layoutTarget,
    order: layout.order,
    hidden: layout.hidden,
    pinned: layout.pinned,
    zoneBySurface: layout.zoneBySurface as Record<
      string,
      'today' | 'work' | 'institution' | 'outlook' | 'private'
    >,
    isDefault: layout.isDefault ?? true,
    surfaceMetadata: (layout.surfaceMetadata as Record<string, unknown>) ?? {},
    layoutVersion: 2,
    updatedAt: layout.updatedAt,
  };
}

export function choosePreferredWorkspaceLayout<TSurfaceId extends string = string>({
  local,
  remote,
}: WorkspaceLayoutSyncSnapshot<TSurfaceId>): WorkspaceLayout<TSurfaceId> | null {
  if (!local) return remote;
  if (!remote) return local;

  const localTime = Date.parse(local.updatedAt);
  const remoteTime = Date.parse(remote.updatedAt);

  if (Number.isNaN(localTime) && Number.isNaN(remoteTime)) return local;
  if (Number.isNaN(localTime)) return remote;
  if (Number.isNaN(remoteTime)) return local;

  return remoteTime > localTime ? remote : local;
}
