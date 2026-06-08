import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, useWindowDimensions } from 'react-native';
import { workspaceLayoutAPI } from '../api/workspaceLayout';
import { SafeZustandStorage } from '../lib/storageWrapper';
import type { WorkspaceLayoutTarget } from '../logic/schemas/workspace-layout.schema';
import {
  createDefaultWorkspaceLayout,
  normalizeWorkspaceLayout,
  resolveWorkspaceSurfaceLayout,
  setWorkspaceSurfaceHidden,
  setWorkspaceSurfaceOrder,
  setWorkspaceSurfacePinned,
  setWorkspaceSurfaceZone,
} from '../logic/workspace/canvas';
import {
  buildWorkspaceLayoutStorageKey,
  choosePreferredWorkspaceLayout,
  resolveWorkspaceLayoutTarget,
  toWorkspaceLayoutRecord,
  toWorkspaceLayoutUpsert,
  type WorkspaceLayoutPlatformKind,
  type WorkspaceLayoutScreenClass,
} from '../logic/workspace/layoutSync';
import type {
  ResolvedWorkspaceSurface,
  WorkspaceLayout,
  WorkspaceSurfaceDefinition,
  WorkspaceZoneId,
} from '../types';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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
  isSyncing: boolean;
  syncError: Error | null;
  refreshFromRemote: () => Promise<void>;
  setLayout: (next: WorkspaceLayout<TSurfaceId>) => void;
  setSurfaceOrder: (order: TSurfaceId[]) => void;
  setSurfaceHidden: (surfaceId: TSurfaceId, hidden: boolean) => void;
  setSurfacePinned: (surfaceId: TSurfaceId, pinned: boolean) => void;
  setSurfaceZone: (surfaceId: TSurfaceId, zone: WorkspaceZoneId) => void;
}

const serializeLayout = <TSurfaceId extends string>(
  layout: WorkspaceLayout<TSurfaceId> | null,
): string => (layout ? JSON.stringify(layout) : 'null');

const canUseRemoteSync = (
  userId: string | null | undefined,
  enableRemoteSync: boolean,
): userId is string => Boolean(enableRemoteSync && userId && UUID_PATTERN.test(userId));

async function fetchRemoteLayout<TSurfaceId extends string>(
  userId: string,
  workspaceId: string,
  layoutTarget: WorkspaceLayoutTarget,
): Promise<WorkspaceLayout<TSurfaceId> | null> {
  const targeted = await workspaceLayoutAPI.getWorkspaceLayout(userId, workspaceId, layoutTarget);
  if (targeted) {
    return toWorkspaceLayoutRecord<TSurfaceId>(targeted);
  }

  if (layoutTarget === 'shared') {
    return null;
  }

  const shared = await workspaceLayoutAPI.getWorkspaceLayout(userId, workspaceId, 'shared');
  return shared ? toWorkspaceLayoutRecord<TSurfaceId>(shared) : null;
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
  compactBreakpoint = 768,
}: UseWorkspaceLayoutSyncOptions<
  TSurfaceId,
  TCapabilityKey,
  TDefinition
>): UseWorkspaceLayoutSyncResult<TSurfaceId, TCapabilityKey, TDefinition> {
  const dimensions = useWindowDimensions();
  const inferredPlatform: WorkspaceLayoutPlatformKind =
    platform ?? (Platform.OS === 'web' ? 'web' : 'native');
  const inferredScreenClass: WorkspaceLayoutScreenClass =
    screenClass ?? (dimensions.width < compactBreakpoint ? 'compact' : 'expanded');
  const layoutTarget = resolveWorkspaceLayoutTarget(inferredPlatform, inferredScreenClass);

  const [layout, setLayoutState] = useState<WorkspaceLayout<TSurfaceId> | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<Error | null>(null);
  const lastSyncedSignatureRef = useRef<string | null>(null);

  const storageKey = userId
    ? buildWorkspaceLayoutStorageKey({
        userId,
        workspaceId,
        layoutTarget,
      })
    : null;

  const defaultLayout = useMemo(
    () =>
      userId
        ? createDefaultWorkspaceLayout({
            workspaceId,
            userId,
            surfaces,
          })
        : null,
    [userId, workspaceId, surfaces],
  );

  const setLayout = useCallback(
    (next: WorkspaceLayout<TSurfaceId>) => {
      setLayoutState(normalizeWorkspaceLayout(next, surfaces));
    },
    [surfaces],
  );

  const refreshFromRemote = useCallback(async () => {
    if (!userId || !canUseRemoteSync(userId, enableRemoteSync)) return;

    setIsSyncing(true);
    setSyncError(null);
    try {
      const remote = await fetchRemoteLayout<TSurfaceId>(userId, workspaceId, layoutTarget);
      if (!remote) return;

      const normalizedRemote = normalizeWorkspaceLayout(remote, surfaces);
      const preferred = choosePreferredWorkspaceLayout({
        local: layout,
        remote: normalizedRemote,
      });

      if (preferred) {
        setLayoutState(preferred);
        lastSyncedSignatureRef.current = serializeLayout(preferred);
      }
    } catch (error) {
      setSyncError(error as Error);
    } finally {
      setIsSyncing(false);
    }
  }, [userId, enableRemoteSync, workspaceId, layoutTarget, surfaces, layout]);

  useEffect(() => {
    let isMounted = true;

    const hydrate = async () => {
      if (!userId || !defaultLayout || !storageKey) {
        if (isMounted) {
          setLayoutState(null);
          setIsHydrated(true);
        }
        return;
      }

      setIsHydrated(false);
      setSyncError(null);

      try {
        const stored = await SafeZustandStorage.getItem(storageKey);
        const localLayout = stored
          ? normalizeWorkspaceLayout(JSON.parse(stored) as WorkspaceLayout<TSurfaceId>, surfaces)
          : defaultLayout;

        let preferred = localLayout;

        if (canUseRemoteSync(userId, enableRemoteSync)) {
          const remote = await fetchRemoteLayout<TSurfaceId>(userId, workspaceId, layoutTarget);
          const normalizedRemote = remote ? normalizeWorkspaceLayout(remote, surfaces) : null;
          preferred =
            choosePreferredWorkspaceLayout({
              local: localLayout,
              remote: normalizedRemote,
            }) ?? localLayout;
        }

        if (!isMounted) return;

        setLayoutState(preferred);
        lastSyncedSignatureRef.current = serializeLayout(preferred);
      } catch (error) {
        if (!isMounted) return;

        setSyncError(error as Error);
        setLayoutState(defaultLayout);
        lastSyncedSignatureRef.current = serializeLayout(defaultLayout);
      } finally {
        if (isMounted) {
          setIsHydrated(true);
        }
      }
    };

    void hydrate();

    return () => {
      isMounted = false;
    };
  }, [userId, workspaceId, layoutTarget, storageKey, defaultLayout, surfaces, enableRemoteSync]);

  useEffect(() => {
    if (!layout || !storageKey || !isHydrated) return;
    void SafeZustandStorage.setItem(storageKey, JSON.stringify(layout));
  }, [layout, storageKey, isHydrated]);

  useEffect(() => {
    if (!layout || !userId || !isHydrated || !canUseRemoteSync(userId, enableRemoteSync)) return;

    const signature = serializeLayout(layout);
    if (signature === lastSyncedSignatureRef.current) return;

    let isCancelled = false;

    const syncRemote = async () => {
      setIsSyncing(true);
      setSyncError(null);

      try {
        await workspaceLayoutAPI.upsertWorkspaceLayout(
          toWorkspaceLayoutUpsert(layout, {
            userId,
            workspaceId,
            layoutTarget,
          }),
        );

        if (!isCancelled) {
          lastSyncedSignatureRef.current = signature;
        }
      } catch (error) {
        if (!isCancelled) {
          setSyncError(error as Error);
        }
      } finally {
        if (!isCancelled) {
          setIsSyncing(false);
        }
      }
    };

    void syncRemote();

    return () => {
      isCancelled = true;
    };
  }, [layout, userId, workspaceId, layoutTarget, isHydrated, enableRemoteSync]);

  useEffect(() => {
    if (!layout || !surfaces.length) return;

    setLayoutState((current: WorkspaceLayout<TSurfaceId> | null) => {
      if (!current) return defaultLayout;

      const normalized = normalizeWorkspaceLayout(current, surfaces);
      return serializeLayout(normalized) === serializeLayout(current) ? current : normalized;
    });
  }, [surfaces, defaultLayout, layout]);

  const resolvedSurfaces = useMemo(
    () => (layout ? resolveWorkspaceSurfaceLayout(surfaces, layout) : []),
    [surfaces, layout],
  );

  const setSurfaceOrder = useCallback(
    (order: TSurfaceId[]) =>
      setLayoutState((current: WorkspaceLayout<TSurfaceId> | null) =>
        current ? setWorkspaceSurfaceOrder(current, order) : current,
      ),
    [],
  );

  const setSurfaceHidden = useCallback(
    (surfaceId: TSurfaceId, hidden: boolean) =>
      setLayoutState((current: WorkspaceLayout<TSurfaceId> | null) =>
        current ? setWorkspaceSurfaceHidden(current, surfaceId, hidden) : current,
      ),
    [],
  );

  const setSurfacePinned = useCallback(
    (surfaceId: TSurfaceId, pinned: boolean) =>
      setLayoutState((current: WorkspaceLayout<TSurfaceId> | null) =>
        current ? setWorkspaceSurfacePinned(current, surfaceId, pinned) : current,
      ),
    [],
  );

  const setSurfaceZone = useCallback(
    (surfaceId: TSurfaceId, zone: WorkspaceZoneId) =>
      setLayoutState((current: WorkspaceLayout<TSurfaceId> | null) =>
        current ? setWorkspaceSurfaceZone(current, surfaceId, zone) : current,
      ),
    [],
  );

  return useMemo(
    () => ({
      layout,
      surfaces: resolvedSurfaces,
      layoutTarget,
      isHydrated,
      isSyncing,
      syncError,
      refreshFromRemote,
      setLayout,
      setSurfaceOrder,
      setSurfaceHidden,
      setSurfacePinned,
      setSurfaceZone,
    }),
    [
      layout,
      resolvedSurfaces,
      layoutTarget,
      isHydrated,
      isSyncing,
      syncError,
      refreshFromRemote,
      setLayout,
      setSurfaceOrder,
      setSurfaceHidden,
      setSurfacePinned,
      setSurfaceZone,
    ],
  );
}
