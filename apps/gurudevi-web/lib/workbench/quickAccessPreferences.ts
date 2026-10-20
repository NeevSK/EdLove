'use client';

import { useCallback, useEffect, useState } from 'react';

export type QuickAccessDomain = 'self' | 'workspace';
export type QuickAccessUsage = Readonly<Record<string, Readonly<{ count: number; lastUsedAt: number }>>>;
export type QuickAccessState = Readonly<{ pinnedIds: readonly string[]; usage: QuickAccessUsage }>;

const changedEvent = 'gurudevi:quick-access-preferences-changed';

function storageKey(domain: QuickAccessDomain, scope: string): string {
  return `gurudevi:quick-access:v1:${domain}:${encodeURIComponent(scope)}`;
}

function readState(
  key: string,
  validIds: ReadonlySet<string> | null,
  defaults: readonly string[],
  pinLimit: number,
): QuickAccessState {
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(key) ?? 'null');
    if (typeof value !== 'object' || value === null) return { pinnedIds: defaults, usage: {} };
    const record = value as { pinnedIds?: unknown; usage?: unknown };
    const pinnedIds = Array.isArray(record.pinnedIds)
      ? [...new Set(record.pinnedIds.filter((id): id is string =>
          typeof id === 'string' && (validIds === null || validIds.has(id)),
        ))].slice(0, pinLimit)
      : [...defaults];
    const usage: Record<string, { count: number; lastUsedAt: number }> = {};
    if (typeof record.usage === 'object' && record.usage !== null) {
      for (const [id, value] of Object.entries(record.usage)) {
        if (
          (validIds === null || validIds.has(id)) &&
          typeof value === 'object' && value !== null &&
          Number.isSafeInteger(value.count) && value.count > 0 &&
          Number.isFinite(value.lastUsedAt) && value.lastUsedAt > 0
        ) {
          usage[id] = { count: value.count, lastUsedAt: value.lastUsedAt };
        }
      }
    }
    return { pinnedIds, usage };
  } catch {
    return { pinnedIds: defaults, usage: {} };
  }
}

function writeState(key: string, state: QuickAccessState): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent(changedEvent, { detail: { key } }));
  } catch {
    // Keep quick access available for the current session when storage is blocked.
  }
}

export function recordQuickAccessUse(domain: QuickAccessDomain, scope: string, id: string): void {
  if (typeof window === 'undefined') return;
  const key = storageKey(domain, scope);
  const defaults = domain === 'self' ? ['fire_journal'] : ['attendance'];
  const current = readState(key, null, defaults, 5);
  const previous = current.usage[id];
  writeState(key, {
    pinnedIds: current.pinnedIds,
    usage: {
      ...current.usage,
      [id]: { count: (previous?.count ?? 0) + 1, lastUsedAt: Date.now() },
    },
  });
}

export function useQuickAccessPreferences(
  domain: QuickAccessDomain,
  scope: string,
  featureIds: readonly string[],
  defaultPinnedIds: readonly string[] = [],
  pinLimit = 5,
) {
  const key = storageKey(domain, scope);
  const validIdsKey = featureIds.join('|');
  const defaultPinnedIdsKey = defaultPinnedIds.join('|');
  const defaults = [...new Set(defaultPinnedIds.filter((id) => featureIds.includes(id)))].slice(0, pinLimit);
  const [state, setState] = useState<QuickAccessState>({ pinnedIds: defaults, usage: {} });

  useEffect(() => {
    const validIds = new Set(validIdsKey ? validIdsKey.split('|') : []);
    const defaults = [...new Set(defaultPinnedIdsKey.split('|').filter((id) => validIds.has(id)))].slice(0, pinLimit);
    const update = () => setState(readState(key, validIds, defaults, pinLimit));
    update();
    const onChanged = (event: Event) => {
      if ((event as CustomEvent<{ key?: string }>).detail?.key === key) update();
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === key) update();
    };
    window.addEventListener(changedEvent, onChanged);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(changedEvent, onChanged);
      window.removeEventListener('storage', onStorage);
    };
  }, [defaultPinnedIdsKey, key, pinLimit, validIdsKey]);

  const togglePin = useCallback((id: string) => {
    if (!featureIds.includes(id)) return;
    const pinned = state.pinnedIds.includes(id);
    if (!pinned && state.pinnedIds.length >= pinLimit) return;
    const next: QuickAccessState = {
      ...state,
      pinnedIds: pinned
        ? state.pinnedIds.filter((item) => item !== id)
        : [...state.pinnedIds, id],
    };
    setState(next);
    writeState(key, next);
  }, [featureIds, key, pinLimit, state]);

  const trackUse = useCallback((id: string) => {
    if (featureIds.includes(id)) recordQuickAccessUse(domain, scope, id);
  }, [domain, featureIds, scope]);

  return { ...state, togglePin, trackUse, pinLimit } as const;
}
