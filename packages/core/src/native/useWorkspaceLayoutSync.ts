import { workspaceLayoutAPI } from '@repo/core/api/workspaceLayout';
import { submitWorkspaceLayoutPatch } from '@repo/core/api/workspaceLayoutPatch';
import { storage } from '@repo/core/lib/storage';
import { SafeZustandStorage } from '@repo/core/lib/storageWrapper';
import { useMutationQueue } from '@repo/core/lib/sync/useMutationQueue';
import type { WorkspaceLayoutTarget } from '@repo/core/logic/schemas/workspace-layout.schema';
import {
  createDefaultWorkspaceLayout,
  normalizeWorkspaceLayout,
  resetWorkspaceAppearance,
  resolveWorkspaceSurfaceLayout,
  setWorkspaceAppearance,
  setWorkspaceGroupOrder,
  setWorkspaceSurfaceHidden,
  setWorkspaceSurfaceOrder,
  setWorkspaceSurfacePinned,
  setWorkspaceSurfaceZone,
} from '@repo/core/logic/workspace/canvas';
import { buildWorkspaceLayoutIntentStorageKey } from '@repo/core/logic/workspace/layoutIntent';
import type { WorkspaceLayoutPatch } from '@repo/core/logic/workspace/layoutPatch';
import { WorkspaceLayoutSession } from '@repo/core/logic/workspace/layoutSession';
import {
  buildWorkspaceLayoutStorageKey,
  resolveWorkspaceLayoutTarget,
  toWorkspaceLayoutRecord,
  WORKSPACE_COMPACT_BREAKPOINT,
  type WorkspaceLayoutPlatformKind,
  type WorkspaceLayoutScreenClass,
} from '@repo/core/logic/workspace/layoutSync';
import {
  shouldRetryWorkspaceSync,
  workspaceSyncRetryDelay,
} from '@repo/core/logic/workspace/syncPolicy';
import type {
  ResolvedWorkspaceSurface,
  WorkspaceLayout,
  WorkspaceSurfaceDefinition,
  WorkspaceZoneId,
} from '@repo/core/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react';
import { Platform, useWindowDimensions } from 'react-native';
import { z } from 'zod';

const EMPTY_INITIAL_PINS: readonly never[] = [];

export interface UseWorkspaceLayoutSyncOptions<
  TSurfaceId extends string = string,
  TCapabilityKey extends string = string,
  TDefinition extends WorkspaceSurfaceDefinition<
    TSurfaceId,
    TCapabilityKey
  > = WorkspaceSurfaceDefinition<TSurfaceId, TCapabilityKey>,
> {
  workspaceId: string;
  userId: string | null | undefined;
  surfaces: TDefinition[];
  enableRemoteSync?: boolean;
  platform?: WorkspaceLayoutPlatformKind;
  screenClass?: WorkspaceLayoutScreenClass;
  compactBreakpoint?: number;
  initialPinnedSurfaceIds?: readonly NoInfer<TSurfaceId>[];
}

export interface UseWorkspaceLayoutSyncResult<
  TSurfaceId extends string = string,
  TCapabilityKey extends string = string,
  TDefinition extends WorkspaceSurfaceDefinition<
    TSurfaceId,
    TCapabilityKey
  > = WorkspaceSurfaceDefinition<TSurfaceId, TCapabilityKey>,
> {
  layout: WorkspaceLayout<TSurfaceId> | null;
  surfaces: (TDefinition & ResolvedWorkspaceSurface<TSurfaceId, TCapabilityKey>)[];
  layoutTarget: WorkspaceLayoutTarget;
  isHydrated: boolean;
  isInitialLayout: boolean;
  isSyncing: boolean;
  syncError: Error | null;
  refreshFromRemote: () => Promise<void>;
  reapplyLocalChanges: () => Promise<void>;
  setLayout: (next: WorkspaceLayout<TSurfaceId>) => void;
  setSurfaceOrder: (order: TSurfaceId[]) => void;
  saveSurfaceOrder: (order: TSurfaceId[]) => Promise<void>;
  setSurfaceHidden: (surfaceId: TSurfaceId, hidden: boolean) => void;
  setSurfacePinned: (surfaceId: TSurfaceId, pinned: boolean) => void;
  toggleSurfacePinned: (surfaceId: TSurfaceId) => void;
  setSurfaceZone: (surfaceId: TSurfaceId, zone: WorkspaceZoneId) => void;
  setAppearance: (appearance: NonNullable<WorkspaceLayout<TSurfaceId>['appearance']>) => void;
  resetAppearance: () => void;
  setGroupOrder: (groupOrder: string[]) => void;
}

export function useWorkspaceLayoutSync<
  TSurfaceId extends string = string,
  TCapabilityKey extends string = string,
  TDefinition extends WorkspaceSurfaceDefinition<
    TSurfaceId,
    TCapabilityKey
  > = WorkspaceSurfaceDefinition<TSurfaceId, TCapabilityKey>,
>({
  workspaceId,
  userId,
  surfaces,
  enableRemoteSync = true,
  platform,
  screenClass,
  compactBreakpoint = WORKSPACE_COMPACT_BREAKPOINT,
  initialPinnedSurfaceIds = EMPTY_INITIAL_PINS,
}: UseWorkspaceLayoutSyncOptions<
  TSurfaceId,
  TCapabilityKey,
  TDefinition
>): UseWorkspaceLayoutSyncResult<TSurfaceId, TCapabilityKey, TDefinition> {
  const dimensions = useWindowDimensions();
  const layoutTarget = resolveWorkspaceLayoutTarget(
    platform ?? (Platform.OS === 'web' ? 'web' : 'native'),
    screenClass ?? (dimensions.width < compactBreakpoint ? 'compact' : 'expanded'),
  );
  const client = useQueryClient();
  const addToQueue = useMutationQueue((state) => state.addToQueue);
  const { mutateAsync } = useMutation({
    mutationFn: ({
      patch,
      isCurrent,
    }: {
      patch: WorkspaceLayoutPatch;
      isCurrent: () => boolean;
    }) => {
      if (!isCurrent()) throw new Error('Workspace layout owner ended before transport.');
      return submitWorkspaceLayoutPatch(patch);
    },
    networkMode: 'always',
    retry: shouldRetryWorkspaceSync,
    retryDelay: workspaceSyncRetryDelay,
  });
  const remoteEnabled = Boolean(enableRemoteSync && z.uuid().safeParse(userId).success);

  const session = useMemo(() => {
    if (!userId) return null;
    const identity = { userId, workspaceId, layoutTarget };
    const cacheKey = buildWorkspaceLayoutStorageKey(identity);
    const intentKey = buildWorkspaceLayoutIntentStorageKey(identity);
    const initial = createDefaultWorkspaceLayout({ userId, workspaceId, surfaces });
    return new WorkspaceLayoutSession(identity, initial, remoteEnabled, {
      readLayout: async () => await SafeZustandStorage.getItem(cacheKey),
      readIntent: async () => await SafeZustandStorage.getItem(intentKey),
      writeLayout: async (layout) => {
        await SafeZustandStorage.setItem(cacheKey, JSON.stringify(layout));
      },
      writeIntent: (intent) => storage.setAsync(intentKey, JSON.stringify(intent)),
      readRemote: () =>
        client.fetchQuery({
          queryKey: ['workspace-layout', userId, workspaceId, layoutTarget],
          networkMode: 'always',
          retry: false,
          staleTime: 0,
          queryFn: async () => {
            const row = await workspaceLayoutAPI.getWorkspaceLayout(
              userId,
              workspaceId,
              layoutTarget,
            );
            if (row) return toWorkspaceLayoutRecord(row);
            if (layoutTarget === 'shared') return null;
            const shared = await workspaceLayoutAPI.getWorkspaceLayout(
              userId,
              workspaceId,
              'shared',
            );
            return shared ? toWorkspaceLayoutRecord(shared) : null;
          },
        }),
      submit: (patch, isCurrent) => mutateAsync({ patch, isCurrent }),
      enqueue: (patch) =>
        addToQueue({
          type: 'PATCH',
          scope: 'workspace',
          name: 'workspace.layout.patch',
          variables: { input: patch },
          userId,
          operationId: patch.operationId,
          inputHash: patch.inputHash,
        }),
    });
    // Registry changes are projected below; they must not replace a draft owner.
  }, [userId, workspaceId, layoutTarget, remoteEnabled, client, mutateAsync, addToQueue]);

  const subscribe = useCallback(
    (listener: () => void) => session?.subscribe(listener) ?? (() => undefined),
    [session],
  );
  const getSnapshot = useCallback(() => session?.getSnapshot() ?? null, [session]);
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => null);
  useEffect(() => {
    if (!session) return;
    void session.start();
    return () => session.stop();
  }, [session]);
  useEffect(() => {
    session?.seedInitialPins(initialPinnedSurfaceIds);
  }, [session, initialPinnedSurfaceIds]);
  const layout = snapshot
    ? normalizeWorkspaceLayout(snapshot.layout as WorkspaceLayout<TSurfaceId>, surfaces)
    : null;
  const edit = useCallback(
    (
      update: (current: WorkspaceLayout) => WorkspaceLayout,
      group: 'arrangement' | 'appearance' | 'groups',
    ) => {
      session?.edit(update, [group]);
    },
    [session],
  );
  const refreshFromRemote = useCallback(async () => {
    if (session && remoteEnabled) await session.refresh();
  }, [session, remoteEnabled]);
  return {
    layout,
    surfaces: layout ? resolveWorkspaceSurfaceLayout(surfaces, layout) : [],
    layoutTarget,
    isHydrated: snapshot?.isHydrated ?? true,
    isInitialLayout: snapshot?.isInitialLayout ?? true,
    isSyncing: snapshot?.isSyncing ?? false,
    syncError: snapshot?.syncError ?? null,
    refreshFromRemote,
    reapplyLocalChanges: async () => {
      await session?.reapply();
    },
    setLayout: (next) => session?.edit(() => next, ['arrangement', 'appearance', 'groups']),
    setSurfaceOrder: (order) =>
      edit((current) => setWorkspaceSurfaceOrder(current, order), 'arrangement'),
    saveSurfaceOrder: async (order) => {
      await session?.saveEdit(
        (current) => setWorkspaceSurfaceOrder(current, order),
        ['arrangement'],
      );
    },
    setSurfaceHidden: (id, hidden) =>
      edit((current) => setWorkspaceSurfaceHidden(current, id, hidden), 'arrangement'),
    setSurfacePinned: (id, pinned) =>
      edit((current) => setWorkspaceSurfacePinned(current, id, pinned), 'arrangement'),
    toggleSurfacePinned: (id) =>
      edit((current) => {
        return setWorkspaceSurfacePinned(current, id, !current.pinned.includes(id));
      }, 'arrangement'),
    setSurfaceZone: (id, zone) =>
      edit((current) => setWorkspaceSurfaceZone(current, id, zone), 'arrangement'),
    setAppearance: (appearance) =>
      edit((current) => setWorkspaceAppearance(current, appearance), 'appearance'),
    resetAppearance: () => edit(resetWorkspaceAppearance, 'appearance'),
    setGroupOrder: (order) => edit((current) => setWorkspaceGroupOrder(current, order), 'groups'),
  };
}
