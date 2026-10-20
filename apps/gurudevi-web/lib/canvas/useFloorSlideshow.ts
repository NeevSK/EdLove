'use client';

import type { FloorWallpaperConfig, WorkspaceWallpaper } from '@repo/core/types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useBrowserVisualBudget } from '../runtime/useBrowserVisualBudget';

export interface UseFloorSlideshowResult {
  activeWallpaper: WorkspaceWallpaper | null;
  nextWallpaper: WorkspaceWallpaper | null;
  isCrossFading: boolean;
  currentIndex: number;
  totalWallpapers: number;
  isSlideshowActive: boolean;
  next: () => void;
  previous: () => void;
  goTo: (index: number) => void;
}

const DEFAULT_CADENCE_SECONDS = 300; // 5 minutes default

export function useFloorSlideshow(
  config?: FloorWallpaperConfig | null,
  fallbackWallpaper?: WorkspaceWallpaper | null,
): UseFloorSlideshowResult {
  const budget = useBrowserVisualBudget();
  const items = config?.items ?? [];
  const mode = config?.mode ?? (fallbackWallpaper ? 'single' : 'off');
  const isSlideshowActive = mode === 'slideshow' && items.length > 1 && budget.quality !== 'essential';

  const [currentIndex, setCurrentIndex] = useState(() => {
    if (config?.activeId) {
      const idx = items.findIndex((item) => item.publicId === config.activeId);
      if (idx >= 0) return idx;
    }
    return 0;
  });

  const [activeWallpaper, setActiveWallpaper] = useState<WorkspaceWallpaper | null>(() => {
    if (mode === 'off') return null;
    if (items.length > 0 && currentIndex < items.length) {
      return items[currentIndex] ?? null;
    }
    return fallbackWallpaper ?? null;
  });

  const [nextWallpaper, setNextWallpaper] = useState<WorkspaceWallpaper | null>(null);
  const [isCrossFading, setIsCrossFading] = useState(false);
  const fadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Transition smoothly to target index with dual-surface cross-fade
  const transitionToIndex = useCallback(
    (targetIndex: number) => {
      if (items.length === 0) return;
      const normalized = (targetIndex + items.length) % items.length;
      const incoming = items[normalized];
      if (!incoming || incoming.url === activeWallpaper?.url) {
        setCurrentIndex(normalized);
        return;
      }

      setNextWallpaper(incoming);
      setIsCrossFading(true);

      if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
      fadeTimeoutRef.current = setTimeout(() => {
        setActiveWallpaper(incoming);
        setNextWallpaper(null);
        setIsCrossFading(false);
        setCurrentIndex(normalized);
      }, 1200); // 1.2s cross-fade duration
    },
    [items, activeWallpaper?.url],
  );

  const next = useCallback(() => {
    transitionToIndex(currentIndex + 1);
  }, [currentIndex, transitionToIndex]);

  const previous = useCallback(() => {
    transitionToIndex(currentIndex - 1);
  }, [currentIndex, transitionToIndex]);

  const goTo = useCallback(
    (index: number) => {
      transitionToIndex(index);
    },
    [transitionToIndex],
  );

  // Synchronize when config items or fallback changes
  useEffect(() => {
    if (mode === 'off') {
      setActiveWallpaper(null);
      setNextWallpaper(null);
      return;
    }

    if (items.length > 0) {
      const validIndex = Math.min(currentIndex, items.length - 1);
      const chosen = items[validIndex] ?? items[0] ?? null;
      setActiveWallpaper(chosen);
    } else {
      setActiveWallpaper(fallbackWallpaper ?? null);
    }
  }, [items, mode, fallbackWallpaper]);

  // Slideshow interval runner with visibilitychange sentinel
  useEffect(() => {
    if (!isSlideshowActive || items.length <= 1) return;

    const intervalSeconds = config?.slideshowIntervalSeconds && config.slideshowIntervalSeconds > 0
      ? config.slideshowIntervalSeconds
      : DEFAULT_CADENCE_SECONDS;

    const intervalMs = intervalSeconds * 1000;

    let isPaused = typeof document !== 'undefined' && document.hidden;

    const advance = () => {
      if (isPaused) return;
      setCurrentIndex((prev) => {
        const nextIdx = (prev + 1) % items.length;
        const incoming = items[nextIdx];
        if (incoming) {
          setNextWallpaper(incoming);
          setIsCrossFading(true);

          if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
          fadeTimeoutRef.current = setTimeout(() => {
            setActiveWallpaper(incoming);
            setNextWallpaper(null);
            setIsCrossFading(false);
          }, 1200);
        }
        return nextIdx;
      });
    };

    const schedule = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(advance, intervalMs);
    };

    const handleVisibility = () => {
      if (document.hidden) {
        isPaused = true;
        if (intervalRef.current) clearInterval(intervalRef.current);
      } else {
        isPaused = false;
        schedule();
      }
    };

    schedule();
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [isSlideshowActive, items, config?.slideshowIntervalSeconds]);

  return {
    activeWallpaper,
    nextWallpaper,
    isCrossFading,
    currentIndex,
    totalWallpapers: items.length,
    isSlideshowActive,
    next,
    previous,
    goTo,
  };
}
