import { workspaceLayoutAPI } from '@repo/core/api/workspaceLayout';
import { SafeZustandStorage } from '@repo/core/lib/storageWrapper';
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
import {
  buildWorkspaceLayoutStorageKey,
  choosePreferredWorkspaceLayout,
  resolveWorkspaceLayoutTarget,
  toWorkspaceLayoutRecord,
  toWorkspaceLayoutUpsert,
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
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, useWindowDimensions } from 'react-native';

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
  setAppearance: (appearance: NonNullable<WorkspaceLayout<TSurfaceId>['appearance']>) => void;
  resetAppearance: () => void;
  setGroupOrder: (groupOrder: string[]) => void;
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
  compactBreakpoint = WORKSPACE_COMPACT_BREAKPOINT,
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
  const lastSyncedLayoutRef = useRef<string | null>(null);

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

  const layoutRef = useRef(layout);
  useEffect(() => {
    layoutRef.current = layout;
  }, [layout]);

  const surfacesHash = useMemo(() => {
    return surfaces.map((s) => `${s.surfaceId}:${s.defaultZone}:${s.defaultOrder}`).join('|');
  }, [surfaces]);

  const lastReconciledSurfacesRef = useRef('');

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
        local: layoutRef.current,
        remote: normalizedRemote,
      });

      if (preferred) {
        setLayoutState(preferred);
        lastSyncedLayoutRef.current = serializeLayout(preferred);
      }
    } catch (error) {
      setSyncError(error as Error);
    } finally {
      setIsSyncing(false);
    }
  }, [userId, enableRemoteSync, workspaceId, layoutTarget, surfaces]);

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
        lastSyncedLayoutRef.current = serializeLayout(preferred);
        lastReconciledSurfacesRef.current = surfacesHash;
      } catch (error) {
        if (!isMounted) return;

        setSyncError(error as Error);
        setLayoutState(defaultLayout);
        lastSyncedLayoutRef.current = serializeLayout(defaultLayout);
        lastReconciledSurfacesRef.current = surfacesHash;
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
  }, [
    userId,
    workspaceId,
    layoutTarget,
    storageKey,
    defaultLayout,
    surfaces,
    enableRemoteSync,
    surfacesHash,
  ]);

  useEffect(() => {
    if (!layout || !storageKey || !isHydrated) return;
    void SafeZustandStorage.setItem(storageKey, JSON.stringify(layout));
  }, [layout, storageKey, isHydrated]);

  useEffect(() => {
    if (!layout || !userId || !isHydrated || !canUseRemoteSync(userId, enableRemoteSync)) return;

    const serialized = serializeLayout(layout);
    if (serialized === lastSyncedLayoutRef.current) return;

    let isCancelled = false;

    const timer = setTimeout(() => {
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
            lastSyncedLayoutRef.current = serialized;
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
    }, 1200);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [layout, userId, workspaceId, layoutTarget, isHydrated, enableRemoteSync]);

  useEffect(() => {
    if (!layout || !surfaces.length) return;
    if (lastReconciledSurfacesRef.current === surfacesHash) return;

    setLayoutState((current: WorkspaceLayout<TSurfaceId> | null) => {
      if (!current) return defaultLayout;

      const normalized = normalizeWorkspaceLayout(current, surfaces);
      lastReconciledSurfacesRef.current = surfacesHash;
      return serializeLayout(normalized) === serializeLayout(current) ? current : normalized;
    });
  }, [surfaces, defaultLayout, surfacesHash]);

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

  const setAppearance = useCallback(
    (appearance: NonNullable<WorkspaceLayout<TSurfaceId>['appearance']>) =>
      setLayoutState((current: WorkspaceLayout<TSurfaceId> | null) =>
        current ? setWorkspaceAppearance(current, appearance) : current,
      ),
    [],
  );

  const resetAppearance = useCallback(
    () =>
      setLayoutState((current: WorkspaceLayout<TSurfaceId> | null) =>
        current ? resetWorkspaceAppearance(current) : current,
      ),
    [],
  );

  const setGroupOrder = useCallback(
    (groupOrder: string[]) =>
      setLayoutState((current: WorkspaceLayout<TSurfaceId> | null) =>
        current ? setWorkspaceGroupOrder(current, groupOrder) : current,
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
      setAppearance,
      resetAppearance,
      setGroupOrder,
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
      setAppearance,
      resetAppearance,
      setGroupOrder,
    ],
  );
}
