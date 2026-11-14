// apps/gurudevi-web/lib/tutii/geometry.ts
import { ComputedPlacement, PopoverPlacement, TargetRect } from './schema';

const TABLET_BREAKPOINT = 768;
const DEFAULT_CARD_WIDTH = 340;
const DEFAULT_CARD_HEIGHT = 160;
const VIEWPORT_MARGIN = 16;
const ARROW_OFFSET = 12;

/**
 * Safely measures a DOM element relative to the viewport.
 */
export function measureTarget(
  selector: string,
  fallbackSelector?: string,
  padding: number = 8,
): { element: HTMLElement; rect: TargetRect } | null {
  if (typeof window === 'undefined') return null;

  let el = document.querySelector<HTMLElement>(selector);
  if (!el && fallbackSelector) {
    el = document.querySelector<HTMLElement>(fallbackSelector);
  }

  if (!el) return null;

  const rawRect = el.getBoundingClientRect();

  // If the element is hidden or has no dimension
  if (rawRect.width === 0 && rawRect.height === 0) {
    return null;
  }

  return {
    element: el,
    rect: {
      top: Math.max(0, rawRect.top - padding),
      left: Math.max(0, rawRect.left - padding),
      width: rawRect.width + padding * 2,
      height: rawRect.height + padding * 2,
      bottom: rawRect.bottom + padding,
      right: rawRect.right + padding,
    },
  };
}

/**
 * Computes placement adapting between mobile bottom-sheet and desktop floating balloon.
 */
export function computePlacement(
  targetRect: TargetRect,
  preferred: PopoverPlacement = 'auto',
  popoverWidth: number = DEFAULT_CARD_WIDTH,
  popoverHeight: number = DEFAULT_CARD_HEIGHT,
): ComputedPlacement {
  if (typeof window === 'undefined') {
    return { mode: 'floating', top: 0, left: 0, arrowSide: 'top' };
  }

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // 1. Mobile & Compact Tablet Mode: Dock as bottom sheet
  if (viewportWidth < TABLET_BREAKPOINT) {
    return {
      mode: 'bottom-sheet',
      top: 0,
      left: 0,
    };
  }

  // 2. Desktop Mode: Floating Speech Balloon with Collision Detection
  let side: 'top' | 'bottom' | 'left' | 'right' = 'bottom';

  if (preferred === 'auto') {
    // If target is in the lower half of viewport, place above
    if (targetRect.bottom + popoverHeight + VIEWPORT_MARGIN > viewportHeight) {
      side = 'top';
    } else {
      side = 'bottom';
    }
  } else {
    side = preferred as 'top' | 'bottom' | 'left' | 'right';
  }

  // Collision checks & auto-flips
  if (
    side === 'bottom' &&
    targetRect.bottom + popoverHeight + ARROW_OFFSET + VIEWPORT_MARGIN > viewportHeight
  ) {
    side = 'top';
  } else if (
    side === 'top' &&
    targetRect.top - popoverHeight - ARROW_OFFSET - VIEWPORT_MARGIN < 0
  ) {
    side = 'bottom';
  }

  let top = 0;
  let left = 0;

  if (side === 'bottom') {
    top = targetRect.bottom + ARROW_OFFSET;
    left = targetRect.left + targetRect.width / 2 - popoverWidth / 2;
  } else if (side === 'top') {
    top = targetRect.top - popoverHeight - ARROW_OFFSET;
    left = targetRect.left + targetRect.width / 2 - popoverWidth / 2;
  } else if (side === 'left') {
    top = targetRect.top + targetRect.height / 2 - popoverHeight / 2;
    left = targetRect.left - popoverWidth - ARROW_OFFSET;
  } else if (side === 'right') {
    top = targetRect.top + targetRect.height / 2 - popoverHeight / 2;
    left = targetRect.right + ARROW_OFFSET;
  }

  // Clamp left and top within screen boundaries
  left = Math.max(VIEWPORT_MARGIN, Math.min(viewportWidth - popoverWidth - VIEWPORT_MARGIN, left));
  top = Math.max(VIEWPORT_MARGIN, Math.min(viewportHeight - popoverHeight - VIEWPORT_MARGIN, top));

  // The arrow on the card points back to the target
  const arrowSide =
    side === 'bottom' ? 'top' : side === 'top' ? 'bottom' : side === 'left' ? 'right' : 'left';

  return {
    mode: 'floating',
    top,
    left,
    arrowSide,
  };
}
