import { WORKSPACE_COMPACT_BREAKPOINT } from '@repo/core/logic/workspace/layoutSync';
import type { FlowNodeStep, FlowPresentation } from '@repo/core/types/domainEntry';

/** Phones are compact; tablets and desktop are regular. */
export type SizeClass = 'compact' | 'regular';

/**
 * How the navigator moves. `dismissTo` goes back to the destination when it is already in the
 * history and replaces the current screen when it isn't (expo-router 58); the web has no stack to
 * dismiss, so there it is a replace.
 */
export type NavigationOp = 'push' | 'replace' | 'dismissTo';

/**
 * Every navigation choice that is a matter of taste rather than correctness, in one place (L9).
 * Each is a default chosen to be safe and to be reversed by changing one value here; the
 * navigator, both adapters and the screen layouts read them, and nothing else decides them.
 * `docs/architecture/2026-11-13-navigation-mental-model.md` gives the reason for each.
 */
export const NAVIGATION_POLICY = {
  /** Below this window width a person is on a phone layout: the workspace's own breakpoint. */
  compactBreakpoint: WORKSPACE_COMPACT_BREAKPOINT,

  /** The presentation a step gets by its purpose. A step's own `presentation` overrides it. */
  presentation: {
    on_ramp: { compact: 'push', regular: 'push' },
    input_form: { compact: 'push', regular: 'push' },
    // Confirming happens over what is being confirmed.
    preview_confirm: { compact: 'sheet', regular: 'modal' },
    // Detail opens beside the list where there is room.
    sub_detail: { compact: 'push', regular: 'panel' },
    // A finished flow is not somewhere to go back to.
    terminal_success: { compact: 'replace', regular: 'replace' },
  } satisfies Record<FlowNodeStep['purpose'], Record<SizeClass, FlowPresentation>>,

  /**
   * Panels need a split layout (expo-router `unstable-split-view` on tablets, a nested outlet on
   * the web) that no domain has yet. Until one does, a panel is shown as this. Turn `panels` on per
   * platform when the layout exists.
   */
  panels: { mobile: false, web: false },
  panelStandIn: 'push' as FlowPresentation,

  /**
   * A finished flow returns to its landing place without leaving the flow's screens behind it.
   * `dismissTo` reuses the landing screen if it is still underneath; `replace` always swaps.
   */
  completion: 'dismissTo' as NavigationOp,

  /**
   * A step whose route doesn't exist never navigates: the adapter reports it and returns the
   * reason, so the screen can say so. Broken flow references are listed and ratcheted in
   * `flowRoutes.test.ts`; they are product decisions, not something to guess at runtime.
   */
  onUnavailable: 'report' as const,

  /** Native sheet look for routes that present `sheet` steps; layouts spread `SHEET_SCREEN`. */
  sheet: { detents: [0.5, 1], grabber: true, cornerRadius: 24 },

  mobile: {
    /**
     * Arriving in another stack puts that stack's anchor (its overview) under the destination, so
     * back goes to the overview rather than out of the stack (expo-router 58 `withAnchor`; a no-op
     * within the same stack).
     */
    withAnchor: true,
    /**
     * Warm a step's screen when the person shows intent (focus, press-in), as links do on the
     * web. `router.prefetch` in expo-router 58.
     */
    prefetchOnIntent: true,
  },

  web: {
    /** Cross-fade route changes with the View Transitions API where the browser has it. */
    viewTransitions: true,
  },
} as const;

/** The size class for a window width. */
export const sizeClassOf = (width: number): SizeClass =>
  width >= NAVIGATION_POLICY.compactBreakpoint ? 'regular' : 'compact';
