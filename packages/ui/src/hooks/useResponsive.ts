import {
  isTabletViewport,
  resolveOrientation,
  responsiveBreakpoints,
} from '@repo/ui/components/layout';
import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

/**
 * useResponsive Hook
 *
 * Provides responsive breakpoints based on window width.
 * Standard breakpoints:
 * - Mobile: < 768
 * - Tablet: >= 768
 * - Desktop: >= 1024
 */
export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const orientation = resolveOrientation(width, height);
  const isTablet = isTabletViewport(width, height);
  const isDesktop = width >= responsiveBreakpoints.desktopMinWidth;

  return useMemo(
    () => ({
      width,
      height,
      isTablet,
      isDesktop,
      isMobile: !isTablet && !isDesktop,
      isLandscape: orientation === 'landscape',
      isPortrait: orientation === 'portrait',
      orientation,
    }),
    [width, height, isTablet, isDesktop, orientation],
  );
}
