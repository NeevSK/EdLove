import type { LeverSpec, LeverTarget } from './types';
/**
 * Picks the lever to lower next (Unity Adaptive Performance's order): levers aimed at the
 * current bottleneck first, then the least visible change, then the lever lowered least so
 * far, then a stable id order so the choice is deterministic.
 */
export declare function chooseLeverToLower(levers: readonly LeverSpec[], levels: Readonly<Record<string, number>>, bottleneck: readonly LeverTarget[], strict?: boolean | 'primary'): LeverSpec | null;
/** Whether a lever relieves any of the given resources. */
export declare function relieves(lever: LeverSpec, targets: readonly LeverTarget[]): boolean;
export declare function validateLevers(levers: readonly LeverSpec[]): void;
//# sourceMappingURL=levers.d.ts.map