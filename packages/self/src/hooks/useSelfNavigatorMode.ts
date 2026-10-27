import { SafeZustandStorage } from '@repo/core/lib/storageWrapper';
import { useFeatureStore } from '@repo/core/store';
import { useCallback, useEffect, useState } from 'react';

export type SelfNavigatorMode = 'carousel' | 'tiled';

const STORAGE_KEY = (userId?: string | null) => `self:navigator-mode:${userId ?? 'guest'}`;

/**
 * Tiles default — new users see the full menu first (discovery).
 * Once comfort is established (manual toggle or AB flag), carousel becomes the calm compact lane.
 * Wired to GrowthBook: flag `canvas.self.tiledDefault` (boolean, default true).
 * AB test: control=carousel, treatment=tiled (or vice versa) via GrowthBook experiment.
 */
export function useSelfNavigatorMode(userId?: string | null) {
  const flags = useFeatureStore((state) => state.flags as unknown as Record<string, unknown>);
  const gbTiledDefault = flags['canvas.self.tiledDefault'];
  const defaultMode: SelfNavigatorMode = gbTiledDefault === false ? 'carousel' : 'tiled';

  const [mode, setModeState] = useState<SelfNavigatorMode>(defaultMode);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setModeState(defaultMode);
  }, [defaultMode]);

  useEffect(() => {
    let mounted = true;
    void Promise.resolve(SafeZustandStorage.getItem(STORAGE_KEY(userId))).then((raw) => {
      if (!mounted) return;
      if (raw === 'tiled' || raw === 'carousel') setModeState(raw as SelfNavigatorMode);
      setIsHydrated(true);
    });
    return () => {
      mounted = false;
    };
  }, [userId]);

  const setMode = useCallback(
    (next: SelfNavigatorMode) => {
      setModeState(next);
      void SafeZustandStorage.setItem(STORAGE_KEY(userId), next);
    },
    [userId],
  );

  const toggle = useCallback(() => {
    setMode(mode === 'carousel' ? 'tiled' : 'carousel');
  }, [mode, setMode]);

  return { mode, setMode, toggle, isHydrated, isDefault: mode === defaultMode };
}
