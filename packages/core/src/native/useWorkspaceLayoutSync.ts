import { storage } from '@repo/core/lib/storage';
import { SafeZustandStorage } from '@repo/core/lib/storageWrapper';
import { dropAt, type MoveBy, moveAmong } from '@repo/core/logic/floor/arrange';
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
  WORKSPACE_COMPACT_BREAKPOINT,
  type WorkspaceLayoutPlatformKind,
  type WorkspaceLayoutScreenClass,
} from '@repo/core/logic/workspace/layoutSync';
import type {
  ResolvedWorkspaceSurface,
  WorkspaceLayout,
  WorkspaceSurfaceDefinition,
  WorkspaceZoneId,
} from '@repo/core/types';
import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react';
import { Platform, useWindowDimensions } from 'react-native';

const EMPTY_INITIAL_PINS: readonly never[] = [];

/**
 * How a layout reaches the person's other devices. Optional: without it the
 * layout is saved on this device only (per account and per screen target),
 * which is the safe default while the v1 server has no layout route. When the
 * route lands, the app passes these three and every device converges through
 * the existing revision/patch protocol.
 */
export interface WorkspaceLayoutRemote {
  read(identity: {
    userId: string;
    workspaceId: string;
    layoutTarget: WorkspaceLayoutTarget;
  }): Promise<WorkspaceLayout | null>;
  submit(
    patch: WorkspaceLayoutPatch,
    isCurrent: () => boolean,
  ): Promise<{ serverRevision: number }>;
  enqueue(patch: WorkspaceLayoutPatch): Promise<void>;
}

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
  remote?: WorkspaceLayoutRemote;
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
  /** True when changes also travel to the person's other devices. */
  isShared: boolean;
  isHydrated: boolean;
  isInitialLayout: boolean;
  isSyncing: boolean;
  syncError: Error | null;
  refreshFromRemote: () => Promise<void>;
  reapplyLocalChanges: () => Promise<void>;
  setLayout: (next: WorkspaceLayout<TSurfaceId>) => void;
  setSurfaceOrder: (order: TSurfaceId[]) => void;
  saveSurfaceOrder: (order: TSurfaceId[]) => Promise<void>;
  /** Move among the pieces drawn beside it (buttons, keyboard). */
  moveSurface: (surfaceId: TSurfaceId, visible: readonly TSurfaceId[], by: MoveBy) => void;
  /** Drop at a place among the pieces drawn beside it (drag). */
  dropSurface: (surfaceId: TSurfaceId, visible: readonly TSurfaceId[], index: number) => void;
  setSurfaceHidden: (surfaceId: TSurfaceId, hidden: boolean) => void;
  setSurfacePinned: (surfaceId: TSurfaceId, pinned: boolean) => void;
  toggleSurfacePinned: (surfaceId: TSurfaceId) => void;
  setSurfaceZone: (surfaceId: TSurfaceId, zone: WorkspaceZoneId) => void;
  setAppearance: (appearance: NonNullable<WorkspaceLayout<TSurfaceId>['appearance']>) => void;
  resetAppearance: () => void;
  setGroupOrder: (groupOrder: string[]) => void;
}

const noRemote = {
  readRemote: async () => null,
  submit: async () => {
    throw new Error('This layout is saved on this device only.');
  },
  enqueue: async () => undefined,
};

/**
 * One person's arrangement of one floor. Keyed by account × floor × screen
 * target, so several accounts on one phone never see each other's layout and
 * a phone and a tablet can differ. Saved on the device first; shared across
 * devices only when `remote` is given.
 */
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
  remote,
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
  const remoteEnabled = Boolean(remote);

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
      ...(remote
        ? {
            readRemote: () => remote.read(identity),
            submit: remote.submit,
            enqueue: remote.enqueue,
          }
        : noRemote),
    });
    // Registry changes are projected below; they must not replace a draft owner.
  }, [userId, workspaceId, layoutTarget, remoteEnabled, remote]);

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
    isShared: remoteEnabled,
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
    moveSurface: (id, visible, by) =>
      edit(
        (current) =>
          setWorkspaceSurfaceOrder(current, [...moveAmong(current.order, visible, id, by)]),
        'arrangement',
      ),
    dropSurface: (id, visible, index) =>
      edit(
        (current) =>
          setWorkspaceSurfaceOrder(current, [...dropAt(current.order, visible, id, index)]),
        'arrangement',
      ),
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
