/**
 * layout.ts — the app's single source of truth for responsive breakpoints.
 *
 * Same philosophy as motion.ts: components read from here instead of
 * hardcoding "if width > 768" inline, so the breakpoints can be tuned once
 * and every consumer follows.
 *
 * Width bands are intentionally coarse (phone / tablet / desktop) rather
 * than device-specific, because the goal is "how much room is there right
 * now" — which is exactly as true for a resized browser window on web as
 * it is for a rotated tablet.
 */
import { useWindowDimensions } from 'react-native';

export const breakpoints = {
  phone: 0,
  tablet: 600,
  desktop: 1024,
} as const;

export type Breakpoint = 'phone' | 'tablet' | 'desktop';

/** How many grid columns list/grid content should use at each band. */
export const columns: Record<Breakpoint, number> = {
  phone: 1,
  tablet: 2,
  desktop: 3,
};

/**
 * Caps content width on wider surfaces so text/cards don't stretch
 * edge-to-edge in a desktop browser window or a landscape tablet — this
 * applies to real content too, not just skeletons, so loading and loaded
 * states share the same reading width.
 */
export const maxContentWidth: Record<Breakpoint, number | '100%'> = {
  phone: '100%',
  tablet: 720,
  desktop: 960,
};

/**
 * Reactive breakpoint — re-renders on rotation (native) or window resize
 * (web), which is the important difference from reading dimensions once.
 */
export function useBreakpoint(): Breakpoint {
  const { width } = useWindowDimensions();
  if (width >= breakpoints.desktop) return 'desktop';
  if (width >= breakpoints.tablet) return 'tablet';
  return 'phone';
}

/**
 * Web-safe version of useBreakpoint that works in browser environments.
 * Falls back to phone if window dimensions aren't available.
 */
export function useBreakpointWeb(): Breakpoint {
  if (typeof window !== 'undefined' && window.innerWidth) {
    const width = window.innerWidth;
    if (width >= breakpoints.desktop) return 'desktop';
    if (width >= breakpoints.tablet) return 'tablet';
  }
  return 'phone';
}

/** Convenience: the resolved column count + max width for the current window. */
export function useResponsiveGrid() {
  const bp = useBreakpoint();
  return {
    breakpoint: bp,
    columns: columns[bp],
    maxWidth: maxContentWidth[bp],
  };
}
