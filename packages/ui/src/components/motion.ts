/**
 * Legacy motion helpers: platform curves and colours built on the motion
 * scales in `@repo/ui/tokens` (`duration`, `easingPoints`, `scale`).
 * Import those scales from tokens; this file goes with the legacy layer.
 *
 * Platform note: Easing.bezier import is conditional to avoid web bundle issues.
 */

import { duration, easingPoints, scale } from '../tokens/motion';

const toCssString = ([x1, y1, x2, y2]: readonly [number, number, number, number]) =>
  `cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})`;

/** For Reanimated's CSS Animations/Transitions API (e.g. BrandPulse). */
export const easing = {
  decelerate: toCssString(easingPoints.decelerate),
  accelerate: toCssString(easingPoints.accelerate),
  standard: toCssString(easingPoints.standard),
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
