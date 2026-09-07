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

import { tokens } from '@repo/ui/tokens';
import { useWindowDimensions } from 'react-native';

export const breakpoints = {
  ...tokens.layout.breakpoints,
} as const;

/**
 * Native viewport thresholds used when orientation matters.
 *
 * The portrait rule intentionally stays at 768px so existing portrait
 * consumers keep their current behavior. In landscape, the short edge is
 * the stable signal that separates a rotated phone from a tablet.
 */
export const responsiveBreakpoints = {
  mobileMaxWidth: 767,
  tabletMinWidth: 768,
  tabletLandscapeMinHeight: 600,
  desktopMinWidth: 1024,
  wideMinWidth: 1280,
} as const;

/** Shared geometry for adaptive two-column surfaces. */
export const responsiveLayout = {
  defaultSidebarWidth: 320,
  landscapeSidebarMaxWidth: 288,
  tabletColumnMinWidth: 320,
} as const;

export type ResponsiveOrientation = 'portrait' | 'landscape';

export function resolveOrientation(width: number, height: number): ResponsiveOrientation {
  return width > height ? 'landscape' : 'portrait';
}

/**
 * Classifies native viewports without treating a wide, short phone as a
 * tablet. This uses named dimensions rather than a device-specific ratio.
 */
export function isTabletViewport(width: number, height: number): boolean {
  return resolveOrientation(width, height) === 'landscape'
    ? height >= responsiveBreakpoints.tabletLandscapeMinHeight
    : width >= responsiveBreakpoints.tabletMinWidth;
}

/** Width passed to the native workspace renderer for a stable mobile lane. */
export function resolveNativeRendererWidth(width: number, height: number): number {
  return isTabletViewport(width, height) ? width : responsiveBreakpoints.mobileMaxWidth;
}

export type Breakpoint = 'phone' | 'tablet' | 'desktop';

/** How many grid columns list/grid content should use at each band. */
export const columns: Record<Breakpoint, number> = {
  phone: tokens.layout.grid.phone,
  tablet: tokens.layout.grid.tablet,
  desktop: tokens.layout.grid.desktop,
};

/**
 * Unified canvas breakpoint — single source for device variation.
 * Mobile stack <768, tablet grid 768-1023, desktop/kanban >=1024.
 * Web compact (<920 per shell) still resolves to mobile stack when width <768,
 * ensuring web-on-mobile gives true mobile layout. See responsiveShell.ts.
 */
export const canvasBreakpoints = {
  mobileMax: 767,
  tabletMin: 768,
  desktopMin: 1024,
  webCompactMax: 920,
  webTabletMax: 1280,
} as const;

export function isMobileLayout(width: number): boolean {
  return width <= canvasBreakpoints.mobileMax;
}

/**
 * Caps content width on wider surfaces so text/cards don't stretch
 * edge-to-edge in a desktop browser window or a landscape tablet — this
 * applies to real content too, not just skeletons, so loading and loaded
 * states share the same reading width.
 */
export const maxContentWidth: Record<Breakpoint, number | '100%'> = {
  phone: tokens.layout.pageFrame.maxWidth.phone,
  tablet: tokens.layout.pageFrame.maxWidth.tablet,
  desktop: tokens.layout.pageFrame.maxWidth.desktop,
};

/** Horizontal breathing room for the shared page frame. */
export const pageGutters: Record<Breakpoint, number> = {
  phone: tokens.layout.pageFrame.gutter.phone,
  tablet: tokens.layout.pageFrame.gutter.tablet,
  desktop: tokens.layout.pageFrame.gutter.desktop,
};

export type LayoutContainerVariant =
  | 'doorway'
  | 'reading'
  | 'compact'
  | 'dashboard'
  | 'wide'
  | 'fullBleed';

export type PageFrame = {
  breakpoint: Breakpoint;
  columns: number;
  gutter: number;
  maxWidth: number | '100%';
  readingMaxWidth: number;
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
 * Web-specific reactive helper referencing canvasBreakpoints with width-only semantics.
 */
export function useResponsiveWeb() {
  const { width } = useWindowDimensions();
  return {
    width,
    isMobile: width <= canvasBreakpoints.mobileMax,
    isTablet: width >= canvasBreakpoints.tabletMin && width < canvasBreakpoints.desktopMin,
    isDesktop: width >= canvasBreakpoints.desktopMin,
    isSplit: width >= canvasBreakpoints.tabletMin,
  };
}

/** Convenience: the resolved column count + max width for the current window. */
export function useResponsiveGrid() {
  const bp = useBreakpoint();
  return {
    breakpoint: bp,
    columns: columns[bp],
    maxWidth: maxContentWidth[bp],
    gutter: pageGutters[bp],
  };
}

/** Shared frame metrics for screens, lists, and loading states. */
export function usePageFrame(variant?: LayoutContainerVariant): PageFrame {
  const breakpoint = useBreakpoint();

  let resolvedMaxWidth: number | '100%' = maxContentWidth[breakpoint];
  if (variant) {
    switch (variant) {
      case 'doorway':
        resolvedMaxWidth = tokens.layout.containers.doorway;
        break;
      case 'reading':
        resolvedMaxWidth = tokens.layout.containers.reading;
        break;
      case 'compact':
        resolvedMaxWidth = tokens.layout.containers.compact;
        break;
      case 'dashboard':
        resolvedMaxWidth = tokens.layout.containers.dashboard;
        break;
      case 'wide':
        resolvedMaxWidth = tokens.layout.containers.wide;
        break;
      case 'fullBleed':
        resolvedMaxWidth = tokens.layout.containers.full;
        break;
    }
  }

  return {
    breakpoint,
    columns: columns[breakpoint],
    gutter: pageGutters[breakpoint],
    maxWidth: resolvedMaxWidth,
    readingMaxWidth: tokens.layout.pageFrame.readingMaxWidth,
  };
}
