import { floorLayoutId } from '@repo/core/logic/floor/bridge';
import type { WorkspaceSurfaceDefinition } from '@repo/core/types';
import {
  type UseWorkspaceLayoutSyncOptions,
  type UseWorkspaceLayoutSyncResult,
  useWorkspaceLayoutSync,
} from './useWorkspaceLayoutSync';

export interface UseFloorLayoutOptions<
  TSurfaceId extends string = string,
  TCapabilityKey extends string = string,
  TDefinition extends WorkspaceSurfaceDefinition<
    TSurfaceId,
    TCapabilityKey
  > = WorkspaceSurfaceDefinition<TSurfaceId, TCapabilityKey>,
> extends Omit<
    UseWorkspaceLayoutSyncOptions<TSurfaceId, TCapabilityKey, TDefinition>,
    'workspaceId'
  > {
  /** The room the floor belongs to: work, self, library… */
  room: string;
  /** The active bond (entity + capacity). Each bond keeps its own arrangement. */
  perspectiveId: string;
}

/**
 * The person's saved arrangement of one room as seen through one bond.
 * A teacher who is also a guardian keeps two Work floors; two accounts on one
 * phone keep separate copies; phone and tablet keep their own targets.
 */
export function useFloorLayout<
  TSurfaceId extends string = string,
  TCapabilityKey extends string = string,
  TDefinition extends WorkspaceSurfaceDefinition<
    TSurfaceId,
    TCapabilityKey
  > = WorkspaceSurfaceDefinition<TSurfaceId, TCapabilityKey>,
>({
  room,
  perspectiveId,
  ...rest
}: UseFloorLayoutOptions<TSurfaceId, TCapabilityKey, TDefinition>): UseWorkspaceLayoutSyncResult<
  TSurfaceId,
  TCapabilityKey,
  TDefinition
> {
  return useWorkspaceLayoutSync<TSurfaceId, TCapabilityKey, TDefinition>({
    ...rest,
    workspaceId: floorLayoutId(room, perspectiveId),
  });
}
