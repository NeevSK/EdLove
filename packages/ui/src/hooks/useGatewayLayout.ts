import { canvasBreakpoints, useBreakpoint, type Breakpoint } from '@repo/ui/components/layout';
import { useWindowDimensions } from 'react-native';

export interface GatewayLayoutMetrics {
  width: number;
  breakpoint: Breakpoint;
  isSplit: boolean;
  isMobile: boolean;
  isDesktop: boolean;
}

/**
 * useGatewayLayout
 *
 * Lightweight, unified reactive layout hook for gateway/onboarding/auth screens on web & native.
 * Resolves split-panel thresholds from single-source-of-truth canvasBreakpoints (768px).
 */
export function useGatewayLayout(): GatewayLayoutMetrics {
  const { width } = useWindowDimensions();
  const breakpoint = useBreakpoint();
  const isSplit = width >= canvasBreakpoints.tabletMin;
  const isMobile = width <= canvasBreakpoints.mobileMax;
  const isDesktop = width >= canvasBreakpoints.desktopMin;

  return {
    width,
    breakpoint,
    isSplit,
    isMobile,
    isDesktop,
  };
}
