/**
 * motion.ts — the app's single source of truth for animation and color tokens.
 *
 * Every screen, component, and skeleton should import from here rather than
 * hardcoding a duration, curve, or hex value inline. That's what lets a single
 * tuning change (e.g. "transitions feel a beat too slow") propagate everywhere
 * at once, instead of hunting through dozens of files.
 *
 * Naming is purpose-first ("transition", "meaningful") not value-first
 * ("ms240"), so revising a number never requires touching call sites — only
 * renaming or removing a token does, and TypeScript will flag every place
 * that needs updating when that happens.
 */

// ---------------------------------------------------------------------------
// Easing — decelerate is the "arriving, not popping" curve used throughout
// the splash work: weighted deceleration, no bounce, no overshoot.
//
// Stored as raw bezier control points (the actual source of truth), because
// Reanimated exposes TWO separate animation systems that each want a
// different shape:
//   - the CSS Animations/Transitions API (used by BrandPulse) wants a
//     "cubic-bezier(x1,y1,x2,y2)" string
//   - the classic worklet API (withTiming, and libraries built on it like
//     react-native-screen-transitions) wants Easing.bezier(x1,y1,x2,y2)
// Deriving both from one set of numbers means a curve change here updates
// every consumer, regardless of which Reanimated API it uses.
// ---------------------------------------------------------------------------
const bezierPoints = {
  /** Entrances, reveals, anything settling into place. */
  decelerate: [0.33, 1, 0.42, 0] as const,
  /** Exits, dismissals — mirror of decelerate. */
  accelerate: [0.58, 0, 0.67, 0] as const,
  /** Symmetric in/out — tab switches, toggles. */
  standard: [0.4, 0, 0.2, 1] as const,
};

const toCssString = ([x1, y1, x2, y2]: readonly [number, number, number, number]) =>
  `cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})`;

/** For Reanimated's CSS Animations/Transitions API (e.g. BrandPulse). */
export const easing = {
  decelerate: toCssString(bezierPoints.decelerate),
  accelerate: toCssString(bezierPoints.accelerate),
  standard: toCssString(bezierPoints.standard),
} as const;

/**
 * For the classic worklet API — pass straight into Easing.bezier(...args),
 * e.g. Easing.bezier(...easingPoints.decelerate). Used by
 * react-native-screen-transitions and any withTiming() call.
 */
export const easingPoints = bezierPoints;

// ---------------------------------------------------------------------------
// Duration — tiered by how often a person will see it. Frequent moments stay
// fast; rare, meaningful moments are allowed to breathe.
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Scale — entrance/rest values for the "settle in" pattern (never scale from
// exactly 0 with a bounce; start slightly recessed and ease to rest).
// ---------------------------------------------------------------------------
export const scale = {
  enter: 0.98,
  rest: 1,
  /** For the tiny living-breath micro-loader pulse. */
  breatheMin: 1,
  breatheMax: 1.03,
} as const;

// ---------------------------------------------------------------------------
// Color — warm across the board. Skeletons and neutrals lean toward the
// brand's orange/peach rather than cold blue-gray; caution states use muted
// amber, never red, so errors stay "paused" rather than "alarmed."
// ---------------------------------------------------------------------------
export const color = {
  brand: {
    orange: '#EF841F',
    peach: '#FAC48C',
    lightPeach: '#FCD6AD',
  },
  neutral: {
    warmGray50: '#FAF7F3',
    warmGray100: '#F3EDE5',
    warmGray200: '#E6DDD0',
    warmGray400: '#B8AA97',
    warmGray600: '#8A7B68',
  },
  state: {
    caution: '#D98E3E',
    cautionBg: '#FBEBD8',
  },
} as const;

// ---------------------------------------------------------------------------
// Convenience: a ready-to-spread CSS-transition config for Reanimated 4's
// CSS Transitions API, covering the most common "soft crossfade + scale-in"
// pattern used for screen nav and simple reveals.
// ---------------------------------------------------------------------------
export const softEnter = {
  transitionProperty: ['opacity', 'transform'] as const,
  transitionDuration: duration.transition,
  transitionTimingFunction: easing.decelerate,
};

export type MotionTokens = {
  easing: typeof easing;
  duration: typeof duration;
  scale: typeof scale;
  color: typeof color;
};
