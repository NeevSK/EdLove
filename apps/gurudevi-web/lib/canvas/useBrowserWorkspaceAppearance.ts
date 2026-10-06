'use client';

import { createSupabaseWorkspaceLayoutRepository } from '@repo/core/adapters/supabase/workspaceLayoutRepository';
import type { WorkspaceLayoutTarget } from '@repo/core/logic/schemas/workspace-layout.schema';
import {
  createDefaultWorkspaceLayout,
  setWorkspaceAppearance,
} from '@repo/core/logic/workspace/canvas';
import {
  toWorkspaceLayoutRecord,
  toWorkspaceLayoutUpsert,
  WORKSPACE_COMPACT_BREAKPOINT,
} from '@repo/core/logic/workspace/layoutSync';
import type { WorkspaceAppearance } from '@repo/core/types';
import { useCallback, useEffect, useState } from 'react';
import { createBrowserSupabaseClient } from '../supabase/browser';

const DEFAULT_APPEARANCE: WorkspaceAppearance = { preset: 'default', motion: 'off' };

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
      !['default', 'dawn', 'garden', 'night'].includes(candidate.preset ?? '') ||
      !['off', 'subtle'].includes(candidate.motion ?? '')
    ) {
      return null;
    }
    return {
      preset: candidate.preset as WorkspaceAppearance['preset'],
      motion: candidate.motion as WorkspaceAppearance['motion'],
    };
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
}: Readonly<{
  accountId: string;
  workspaceId: string;
  enableRemoteSync?: boolean;
  defaultGroupOrder?: readonly string[];
}>) {
  const defaultGroupOrderKey = defaultGroupOrder.join('|');
  const [layoutTarget, setLayoutTarget] = useState<WorkspaceLayoutTarget>('web');
  const [appearance, setAppearanceState] = useState<WorkspaceAppearance>(DEFAULT_APPEARANCE);
  const [groupOrder, setGroupOrderState] = useState<string[]>([...defaultGroupOrder]);
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
    setStatus('loading');
    const local = readLocal(key);
    setGroupOrderState(readGroups(groupsKey, defaultGroupOrder));
    if (local) setAppearanceState(local);

    if (!enableRemoteSync) {
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
        const remote = remoteLayout?.appearance;
        const remoteGroups = remoteLayout?.groupOrder;
        if (remote) {
          setAppearanceState(remote);
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
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus(local ? 'offline' : 'error');
      });

    return () => {
      cancelled = true;
    };
  }, [accountId, defaultGroupOrderKey, enableRemoteSync, layoutTarget, workspaceId]);

  const setAppearance = useCallback(
    async (next: WorkspaceAppearance) => {
      const key = storageKey(accountId, workspaceId, layoutTarget);
      setAppearanceState(next);
      const canPersistLocally = writeLocal(key, next);
      setStatus(canPersistLocally ? 'saving' : 'error');

      if (!enableRemoteSync) {
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
        const nextLayout = setWorkspaceAppearance(currentLayout, next);
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
    [accountId, enableRemoteSync, layoutTarget, workspaceId],
  );

  const setGroupOrder = useCallback(
    async (next: string[]) => {
      // The caller's order is authoritative. Reading the previous local order
      // here would make an intentional reorder appear unchanged.
      const normalized = normalizeGroups(next, defaultGroupOrder);
      setGroupOrderState(normalized);
      const canPersistLocally = writeLocal(
        groupStorageKey(accountId, workspaceId, layoutTarget),
        normalized,
      );
      setStatus(canPersistLocally ? 'saving' : 'error');
      if (!enableRemoteSync) {
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
        // The local order remains available when the account sync is offline.
        setStatus('offline');
      }
    },
    [accountId, defaultGroupOrderKey, enableRemoteSync, layoutTarget, workspaceId],
  );

  const resetAppearance = useCallback(() => setAppearance(DEFAULT_APPEARANCE), [setAppearance]);

  return {
    appearance,
    groupOrder,
    layoutTarget,
    resetAppearance,
    status,
    setAppearance,
    setGroupOrder,
  };
}
