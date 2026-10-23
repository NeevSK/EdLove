import type { LeverSpec } from './types';
/**
 * Verger's built-in levers. They act on the whole app through the platform package, whatever
 * the host's components do, so a host only lists them in its manifest to switch them on.
 */
/** Caps the display refresh rate (config `refreshCapHz`); the platform package applies it. */
export declare const VERGER_REFRESH_CAP: LeverSpec;
/**
 * Forces reduced motion for animations that start while it is set (Reanimated decides at
 * start). The last UI-thread containment step; it does not stop loops already running, nor
 * CSS animations (Reanimated 4.7.1). The React package applies it.
 */
export declare const VERGER_GLOBAL_MOTION: LeverSpec;
export declare const VERGER_BUILTIN_LEVERS: readonly LeverSpec[];
//# sourceMappingURL=builtins.d.ts.map