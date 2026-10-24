import type { LeverSpec } from './types';

/**
 * Verger's built-in levers. They act on the whole app through the platform package, whatever
 * the host's components do, so a host only lists them in its manifest to switch them on.
 */

/** Caps the display refresh rate (config `refreshCapHz`); the platform package applies it. */
export const VERGER_REFRESH_CAP: LeverSpec = {
  id: 'refresh-rate',
  maxLevel: 1,
  visualImpact: 'medium',
  target: 'gpu',
  // Fewer frames per second: each frame gets more time on the UI and render threads, and the
  // display and GPU draw less.
  alsoRelieves: ['cpu', 'energy'],
  ambient: false,
  motion: false,
  levels: ['the display maximum', 'capped (config refreshCapHz)'],
  requires: [{ capability: 'refreshCap', otherwiseLevel: 1 }],
  whenIdle: 1,
  whenWarm: 1,
  actuator: 'refresh-cap',
};

/**
 * Forces reduced motion for animations that start while it is set (Reanimated decides at
 * start). The last UI-thread containment step; it does not stop loops already running, nor
 * CSS animations (Reanimated 4.7.1). The React package applies it.
 */
export const VERGER_GLOBAL_MOTION: LeverSpec = {
  id: 'global-motion',
  maxLevel: 1,
  visualImpact: 'high',
  target: 'gpu',
  // Reanimated animations run on the UI thread.
  alsoRelieves: ['cpu'],
  ambient: false,
  motion: true,
  levels: ['animations run', 'reduced motion forced for animations that start'],
  closedLoopOnly: true,
  actuator: 'global-reduced-motion',
};

export const VERGER_BUILTIN_LEVERS: readonly LeverSpec[] = [
  VERGER_REFRESH_CAP,
  VERGER_GLOBAL_MOTION,
];
