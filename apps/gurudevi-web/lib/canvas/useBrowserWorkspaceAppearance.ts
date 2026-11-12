'use client';

import { createSupabaseWorkspaceLayoutRepository } from '@repo/core/adapters/supabase/workspaceLayoutRepository';
import type { WorkspaceLayoutTarget } from '@repo/core/logic/schemas/workspace-layout.schema';
import {
  createDefaultWorkspaceLayout,
  setWorkspaceAppearance,
} from '@repo/core/logic/workspace/canvas';
import { appearanceForSync, mergeSavedGround } from '@repo/core/logic/workspace/ground';
import {
  toWorkspaceLayoutRecord,
  toWorkspaceLayoutUpsert,
  WORKSPACE_COMPACT_BREAKPOINT,
} from '@repo/core/logic/workspace/layoutSync';
import type { WorkspaceAppearance } from '@repo/core/types';
import { useCallback, useEffect, useState } from 'react';
import { createBrowserSupabaseClient } from '../supabase/browser';
import { DEFAULT_APPEARANCE, EXPLORE_DEFAULT_APPEARANCE } from './appearanceConstants';

type AppearanceStatus = 'loading' | 'ready' | 'saving' | 'saved' | 'offline' | 'error';

function storageKey(
  accountId: string,
  workspaceId: string,
  layoutTarget: WorkspaceLayoutTarget,
): string {
  return `workspace-appearance:${workspaceId}:${layoutTarget}:${accountId}`;
}

function groupStorageKey(
  accountId: string,
  workspaceId: string,
  layoutTarget: WorkspaceLayoutTarget,
): string {
  return `workspace-groups:${workspaceId}:${layoutTarget}:${accountId}`;
}

function pinnedStorageKey(
  accountId: string,
  workspaceId: string,
  layoutTarget: WorkspaceLayoutTarget,
): string {
  return `workspace-pinned:${workspaceId}:${layoutTarget}:${accountId}`;
}

function readPinned(key: string, defaults: readonly string[]): string[] {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(key) ?? 'null');
    return Array.isArray(parsed) && parsed.every((value) => typeof value === 'string')
      ? parsed.length > 0
        ? parsed
        : [...defaults]
      : [...defaults];
  } catch {
    return [...defaults];
  }
}

function readGroups(key: string, defaults: readonly string[]): string[] {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(key) ?? 'null');
    return Array.isArray(parsed) && parsed.every((value) => typeof value === 'string')
      ? [...new Set([...parsed, ...defaults])].filter((value) => defaults.includes(value))
      : [...defaults];
  } catch {
    return [...defaults];
  }
}

function normalizeGroups(values: readonly string[], allowed: readonly string[]): string[] {
  const allowedSet = new Set(allowed);
  return [...new Set(values)].filter((value) => allowedSet.has(value));
}

function readLocal(key: string): WorkspaceAppearance | null {
  try {
    const value = window.localStorage.getItem(key);
    if (!value) return null;
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== 'object') return null;
    const candidate = parsed as Partial<WorkspaceAppearance>;
    if (
      !['default', 'dawn', 'garden', 'night', 'none'].includes(candidate.preset ?? '') ||
      !['off', 'subtle'].includes(candidate.motion ?? '')
    ) {
      return null;
    }
    const result: WorkspaceAppearance = {
      preset: candidate.preset as WorkspaceAppearance['preset'],
      motion: candidate.motion as WorkspaceAppearance['motion'],
    };
    if (candidate.wallpaper !== undefined) {
      result.wallpaper = candidate.wallpaper;
    }
    if (candidate.wallpaperConfig !== undefined) {
      result.wallpaperConfig = candidate.wallpaperConfig;
    }
    if (candidate.groundMode !== undefined) {
      result.groundMode = candidate.groundMode;
    }
    // These were dropped on read before, so a chosen world or texture never came back.
    if (typeof candidate.worldId === 'string') result.worldId = candidate.worldId;
    if (typeof candidate.atmosphere === 'string') result.atmosphere = candidate.atmosphere;
    if (candidate.groundScope === 'world' || candidate.groundScope === 'room') {
      result.groundScope = candidate.groundScope;
    }
    if (typeof candidate.changedAt === 'string') result.changedAt = candidate.changedAt;
    return result;
  } catch {
    return null;
  }
}

function writeLocal(key: string, value: unknown): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function useBrowserWorkspaceAppearance({
  accountId,
  workspaceId,
  enableRemoteSync = true,
  defaultGroupOrder = [],
  defaultPinnedIds = [],
  defaultAppearance,
}: Readonly<{
  accountId: string;
  workspaceId: string;
  enableRemoteSync?: boolean;
  defaultGroupOrder?: readonly string[];
  defaultPinnedIds?: readonly string[];
  defaultAppearance?: WorkspaceAppearance;
}>) {
  const isExplore =
    accountId === 'guest-explorer' ||
    accountId === 'explore-guest' ||
    accountId === 'explore' ||
    workspaceId === 'explore';
  const shouldSyncRemotely = enableRemoteSync && !isExplore;
  const initialFallback =
    defaultAppearance ?? (isExplore ? EXPLORE_DEFAULT_APPEARANCE : DEFAULT_APPEARANCE);
  const defaultGroupOrderKey = defaultGroupOrder.join('|');
  const defaultPinnedIdsKey = defaultPinnedIds.join('|');
  const [layoutTarget, setLayoutTarget] = useState<WorkspaceLayoutTarget>('web');
  const [appearance, setAppearanceState] = useState<WorkspaceAppearance>(initialFallback);
  /** What is actually saved for this room (null: nothing yet, so it follows the world). */
  const [stored, setStored] = useState<WorkspaceAppearance | null>(null);
  const [groupOrder, setGroupOrderState] = useState<string[]>([...defaultGroupOrder]);
  const [pinnedIds, setPinnedIdsState] = useState<string[]>([...defaultPinnedIds]);
  const [status, setStatus] = useState<AppearanceStatus>('loading');

  useEffect(() => {
    const updateLayoutTarget = () => {
      setLayoutTarget(window.innerWidth < WORKSPACE_COMPACT_BREAKPOINT ? 'mobile' : 'web');
    };

    updateLayoutTarget();
    window.addEventListener('resize', updateLayoutTarget);
    return () => window.removeEventListener('resize', updateLayoutTarget);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const key = storageKey(accountId, workspaceId, layoutTarget);
    const groupsKey = groupStorageKey(accountId, workspaceId, layoutTarget);
    const pinnedKey = pinnedStorageKey(accountId, workspaceId, layoutTarget);
    setStatus('loading');
    const local = readLocal(key);
    setGroupOrderState(readGroups(groupsKey, defaultGroupOrder));
    setPinnedIdsState(readPinned(pinnedKey, defaultPinnedIds));
    setStored(local);
    // A saved look is shown as saved. (Explore used to force its slideshow back over any saved
    // look whose playback was off, so leaving Photo there never stuck.)
    setAppearanceState(local ?? initialFallback);

    if (!shouldSyncRemotely) {
      setStatus('ready');
      return () => {
        cancelled = true;
      };
    }

    const client = createBrowserSupabaseClient();
    if (!client) {
      setStatus('offline');
      return () => {
        cancelled = true;
      };
    }

    const repository = createSupabaseWorkspaceLayoutRepository(client);
    void repository
      .getLayout(accountId, workspaceId, layoutTarget)
      .then(async (record) => {
        if (record || layoutTarget === 'shared') return record;
        return repository.getLayout(accountId, workspaceId, 'shared');
      })
      .then((record) => {
        if (cancelled) return;
        const remoteLayout = record ? toWorkspaceLayoutRecord(record) : null;
        // The newer of this device's copy and the account's wins: a change made while the account
        // copy was loading is not overwritten by the older copy arriving late.
        const remote = mergeSavedGround(readLocal(key), remoteLayout?.appearance);
        const remoteGroups = remoteLayout?.groupOrder;
        const remotePinned = remoteLayout?.pinned;
        if (remote) {
          setAppearanceState(remote);
          setStored(remote);
          writeLocal(key, remote);
        }
        if (remoteGroups) {
          const normalizedRemoteGroups = normalizeGroups(remoteGroups, [
            ...remoteGroups,
            ...defaultGroupOrder,
          ]);
          setGroupOrderState(normalizedRemoteGroups);
          writeLocal(groupsKey, normalizedRemoteGroups);
        }
        if (remotePinned && remotePinned.length > 0) {
          setPinnedIdsState(remotePinned);
          writeLocal(pinnedKey, remotePinned);
        }
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus(local ? 'offline' : 'error');
      });

    return () => {
      cancelled = true;
    };
  }, [
    accountId,
    defaultGroupOrderKey,
    defaultPinnedIdsKey,
    layoutTarget,
    shouldSyncRemotely,
    workspaceId,
  ]);

  const setAppearance = useCallback(
    async (next: WorkspaceAppearance) => {
      const key = storageKey(accountId, workspaceId, layoutTarget);
      setAppearanceState(next);
      setStored(next);
      const canPersistLocally = writeLocal(key, next);
      setStatus(canPersistLocally ? 'saving' : 'error');

      if (!shouldSyncRemotely) {
        setStatus(canPersistLocally ? 'saved' : 'error');
        return;
      }

      const client = createBrowserSupabaseClient();
      if (!client) {
        setStatus('offline');
        return;
      }

      try {
        const repository = createSupabaseWorkspaceLayoutRepository(client);
        const current =
          (await repository.getLayout(accountId, workspaceId, layoutTarget)) ??
          (layoutTarget === 'shared'
            ? null
            : await repository.getLayout(accountId, workspaceId, 'shared'));
        const currentLayout = current
          ? toWorkspaceLayoutRecord(current)
          : createDefaultWorkspaceLayout({ workspaceId, userId: accountId, surfaces: [] });
        const nextLayout = setWorkspaceAppearance(currentLayout, appearanceForSync(next));
        await repository.upsertLayout(
          toWorkspaceLayoutUpsert(nextLayout, {
            userId: accountId,
            workspaceId,
            layoutTarget,
          }),
        );
        setStatus('saved');
      } catch {
        setStatus('offline');
      }
    },
    [accountId, layoutTarget, shouldSyncRemotely, workspaceId],
  );

  const setGroupOrder = useCallback(
    async (next: string[]) => {
      const normalized = normalizeGroups(next, defaultGroupOrder);
      setGroupOrderState(normalized);
      const canPersistLocally = writeLocal(
        groupStorageKey(accountId, workspaceId, layoutTarget),
        normalized,
      );
      setStatus(canPersistLocally ? 'saving' : 'error');
      if (!shouldSyncRemotely) {
        setStatus(canPersistLocally ? 'saved' : 'error');
        return;
      }

      const client = createBrowserSupabaseClient();
      if (!client) {
        setStatus('offline');
        return;
      }
      try {
        const repository = createSupabaseWorkspaceLayoutRepository(client);
        const current =
          (await repository.getLayout(accountId, workspaceId, layoutTarget)) ??
          (layoutTarget === 'shared'
            ? null
            : await repository.getLayout(accountId, workspaceId, 'shared'));
        const currentLayout = current
          ? toWorkspaceLayoutRecord(current)
          : createDefaultWorkspaceLayout({ workspaceId, userId: accountId, surfaces: [] });
        await repository.upsertLayout(
          toWorkspaceLayoutUpsert(
            { ...currentLayout, groupOrder: normalized },
            { userId: accountId, workspaceId, layoutTarget },
          ),
        );
        setStatus('saved');
      } catch {
        setStatus('offline');
      }
    },
    [accountId, defaultGroupOrderKey, layoutTarget, shouldSyncRemotely, workspaceId],
  );

  const setPinnedIds = useCallback(
    async (next: string[]) => {
      setPinnedIdsState(next);
      const canPersistLocally = writeLocal(
        pinnedStorageKey(accountId, workspaceId, layoutTarget),
        next,
      );
      setStatus(canPersistLocally ? 'saving' : 'error');
      if (!shouldSyncRemotely) {
        setStatus(canPersistLocally ? 'saved' : 'error');
        return;
      }

      const client = createBrowserSupabaseClient();
      if (!client) {
        setStatus('offline');
        return;
      }
      try {
        const repository = createSupabaseWorkspaceLayoutRepository(client);
        const current =
          (await repository.getLayout(accountId, workspaceId, layoutTarget)) ??
          (layoutTarget === 'shared'
            ? null
            : await repository.getLayout(accountId, workspaceId, 'shared'));
        const currentLayout = current
          ? toWorkspaceLayoutRecord(current)
          : createDefaultWorkspaceLayout({ workspaceId, userId: accountId, surfaces: [] });
        await repository.upsertLayout(
          toWorkspaceLayoutUpsert(
            { ...currentLayout, pinned: next },
            { userId: accountId, workspaceId, layoutTarget },
          ),
        );
        setStatus('saved');
      } catch {
        setStatus('offline');
      }
    },
    [accountId, layoutTarget, shouldSyncRemotely, workspaceId],
  );

  // Reset gives up any own look: a room follows the world again; the world returns to defaults
  // (and, being newer, so does every room that followed it).
  const resetAppearance = useCallback(
    () =>
      setAppearance({
        ...DEFAULT_APPEARANCE,
        groundScope: 'world',
        changedAt: new Date().toISOString(),
      }),
    [setAppearance],
  );

  return {
    appearance,
    stored,
    groupOrder,
    pinnedIds,
    layoutTarget,
    resetAppearance,
    status,
    setAppearance,
    setGroupOrder,
    setPinnedIds,
  };
}
