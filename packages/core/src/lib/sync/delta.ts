import { applyPatch, compare, type Operation } from 'fast-json-patch';

/**
 * DeltaResonance Utility
 *
 * Provides surgical state diffing and patching for low-bandwidth sync.
 * Aligned with 2026 "Server-First" and "Resilience-First" standards.
 */
export const DeltaResonance = {
  /**
   * Generates a JSON Patch (delta) between two states.
   */
  diff: <T>(original: T, updated: T): Operation[] => {
    return compare(original as any, updated as any);
  },

  /**
   * Applies a JSON Patch to a state.
   */
  patch: <T>(original: T, patch: Operation[]): T => {
    const result = applyPatch(original as any, patch);
    return result.newDocument as T;
  },

  /**
   * Optimizes a mutation payload by converting it to a delta if possible.
   * This is used in useSafeMutation to reduce queue size.
   */
  createDeltaMutation: <T>(baseState: T, newState: T, name: string) => {
    const patch = DeltaResonance.diff(baseState, newState);
    return {
      name,
      type: 'DELTA' as const,
      patch,
      timestamp: Date.now(),
    };
  },
};
