/**
 * Motion scales: durations, curves and press scales that do not change per
 * world. A world's motion recipe (`@repo/ui/theme`, `resolveMotion`) scales
 * these by its tempo and the device's experience level.
 *
 * Naming is purpose-first ("transition", "meaningful") not value-first
 * ("ms240"), so revising a number never requires touching call sites.
 */

export const duration = {
  /** Toasts, trivial success (a field saved), small state flips. */
  micro: 150,
  /** Screen nav, tab switches — the thing people feel hundreds of times a session. */
  transition: 240,
  /** Shared-element / bounds-style transitions (react-native-screen-transitions). */
  shared: 380,
  /** Meaningful success — first connection, a session booked, a reflection saved. */
  meaningful: 520,
  /** One full cycle of the ambient "living breath" pulse loop. */
  breathe: 3000,
} as const;

/** Cubic-bezier control points; platforms turn them into their own curve type. */
export const easingPoints = {
  /** Entrances, reveals, anything settling into place. */
  decelerate: [0.33, 1, 0.42, 0] as const,
  /** Exits, dismissals — mirror of decelerate. */
  accelerate: [0.58, 0, 0.67, 0] as const,
  /** Symmetric in/out — tab switches, toggles. */
  standard: [0.4, 0, 0.2, 1] as const,
};

export const scale = {
  enter: 0.98,
  rest: 1,
  /** For the tiny living-breath micro-loader pulse. */
  breatheMin: 1,
  breatheMax: 1.03,
} as const;
