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
 *
 * Platform note: Easing.bezier import is conditional to avoid web bundle issues.
 */

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
 * Reanimated's native CSS animation API accepts named timing functions, but
 * does not accept CSS cubic-bezier strings. Keep this platform-specific
 * mapping separate from the web CSS tokens above.
 */
export const nativeEasing = {
  decelerate: 'ease-out',
  accelerate: 'ease-in',
  standard: 'ease-in-out',
} as const;

export const easingPoints = bezierPoints;

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

export const scale = {
  enter: 0.98,
  rest: 1,
  /** For the tiny living-breath micro-loader pulse. */
  breatheMin: 1,
  breatheMax: 1.03,
} as const;

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
