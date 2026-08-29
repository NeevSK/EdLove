import { SafeZustandStorage } from '@repo/core/lib/storageWrapper';
import type { SelfViewRole } from '@repo/self/screens/self/roleResolution';
import { useCallback, useEffect, useMemo, useState } from 'react';

export type SelfFeatureZone = 'today' | 'private' | 'shared';

export interface SelfCanvasPreferences {
  layout: {
    version: 2;
    isDefault: boolean;
    hiddenIds: string[];
    order: string[];
  };
  features: {
    selectedIds: string[];
    customOrder: string[];
    hiddenIds: string[];
    zoneOverrides: Partial<Record<string, SelfFeatureZone>>;
    roleWeights: Partial<Record<SelfViewRole, number>>;
  };
  viewMode: 'carousel' | 'tiled';
  lastSyncedAt: number;
}

const STORAGE_KEY = (userId?: string | null) => `self:canvas-preferences:${userId ?? 'guest'}`;

export const DEFAULT_SELF_PREFERENCES: SelfCanvasPreferences = {
  layout: { version: 2, isDefault: true, hiddenIds: [], order: [] },
  features: { selectedIds: [], customOrder: [], hiddenIds: [], zoneOverrides: {}, roleWeights: {} },
  viewMode: 'tiled',
  lastSyncedAt: 0,
};

function parse(raw: string | null): SelfCanvasPreferences | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<SelfCanvasPreferences>;
    if (!parsed.layout || !parsed.features) return null;
    return { ...DEFAULT_SELF_PREFERENCES, ...parsed, layout: { ...DEFAULT_SELF_PREFERENCES.layout, ...parsed.layout }, features: { ...DEFAULT_SELF_PREFERENCES.features, ...parsed.features } } as SelfCanvasPreferences;
  } catch {
    return null;
  }
}

export function useSelfCanvasPreferences(userId?: string | null) {
  const [preferences, setPreferences] = useState<SelfCanvasPreferences>(DEFAULT_SELF_PREFERENCES);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;
    void Promise.resolve(SafeZustandStorage.getItem(STORAGE_KEY(userId))).then((raw) => {
      if (!mounted) return;
      const parsed = parse(raw);
      if (parsed) setPreferences(parsed);
      setIsHydrated(true);
    });
    return () => {
      mounted = false;
    };
  }, [userId]);

  const persist = useCallback(
    (next: SelfCanvasPreferences) => {
      setPreferences(next);
      void SafeZustandStorage.setItem(STORAGE_KEY(userId), JSON.stringify({ ...next, lastSyncedAt: Date.now() }));
    },
    [userId],
  );

  const setHidden = useCallback(
    (featureId: string, hidden: boolean) => {
      const hiddenIds = hidden
        ? [...new Set([...preferences.features.hiddenIds, featureId])]
        : preferences.features.hiddenIds.filter((id) => id !== featureId);
      persist({ ...preferences, features: { ...preferences.features, hiddenIds }, layout: { ...preferences.layout, isDefault: false, hiddenIds } });
    },
    [preferences, persist],
  );

  const setOrder = useCallback(
    (order: string[]) => {
      persist({
        ...preferences,
        features: { ...preferences.features, customOrder: order, selectedIds: order },
        layout: { ...preferences.layout, isDefault: false, order },
      });
    },
    [preferences, persist],
  );

  const setViewMode = useCallback(
    (viewMode: 'carousel' | 'tiled') => {
      persist({ ...preferences, viewMode });
    },
    [preferences, persist],
  );

  const reset = useCallback(() => {
    persist(DEFAULT_SELF_PREFERENCES);
  }, [persist]);

  return useMemo(
    () => ({ preferences, isHydrated, setHidden, setOrder, setViewMode, reset, persist }),
    [preferences, isHydrated, setHidden, setOrder, setViewMode, reset, persist],
  );
}
