import { useActiveSubTabsStore } from '@repo/core/store/useActiveSubTabsStore';
import { useCallback, useRef } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

export interface UseScrollChromeCollapserOptions {
  collapseThreshold?: number;
  expandThreshold?: number;
  topBoundary?: number;
}

/**
 * useScrollChromeCollapser: Directional scroll listener that automatically collapses
 * top header and bottom tab chrome when reading downwards, and immediately restores
 * them on upward reflex or upon reaching the top boundary.
 */
export function useScrollChromeCollapser(options: UseScrollChromeCollapserOptions = {}) {
  const { collapseThreshold = 15, expandThreshold = 10, topBoundary = 10 } = options;

  const autoHide = useActiveSubTabsStore((s) => s.preferences.autoHideChromeOnScroll);
  const isChromeVisible = useActiveSubTabsStore((s) => s.isChromeVisible);
  const setChromeVisible = useActiveSubTabsStore((s) => s.setChromeVisible);

  const lastOffsetRef = useRef(0);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!autoHide) return;

      const currentY = event.nativeEvent.contentOffset.y;
      const delta = currentY - lastOffsetRef.current;

      // 1. Always reveal at the top boundary
      if (currentY <= topBoundary) {
        setChromeVisible(true);
        lastOffsetRef.current = currentY;
        return;
      }

      // 2. Scrolling down hides chrome
      if (delta > collapseThreshold && isChromeVisible) {
        setChromeVisible(false);
      }
      // 3. Scrolling up reveals chrome
      else if (delta < -expandThreshold && !isChromeVisible) {
        setChromeVisible(true);
      }

      lastOffsetRef.current = currentY;
    },
    [autoHide, collapseThreshold, expandThreshold, topBoundary, isChromeVisible, setChromeVisible],
  );

  return {
    onScroll: handleScroll,
    isChromeVisible,
    autoHide,
  };
}
