import { useCallback } from 'react';
import { useUIStore } from '@repo/core/store/useUIStore';

export interface UseScaffoldDismissalResult {
  /** True when the user has completed or dismissed this scaffold >= maxCompletions times */
  isDismissed: boolean;
  /** Number of times this scaffold has been successfully completed or acknowledged */
  completionCount: number;
  /** Increments the completion count by 1 and persists to sovereign storage */
  completeScaffold: () => void;
  /** Resets count to 0 if the user explicitly wants to restore scaffolding */
  resetScaffold: () => void;
}

/**
 * Direct imperative read/write for scaffold state outside React render loop.
 */
export function getScaffoldDismissal(
  scaffoldKey: string,
  maxCompletions: number = 3,
): UseScaffoldDismissalResult {
  const completionCount =
    useUIStore.getState().scaffoldCompletions?.[scaffoldKey] ?? 0;
  return {
    isDismissed: completionCount >= maxCompletions,
    completionCount,
    completeScaffold: () =>
      useUIStore.getState().incrementScaffoldCompletion?.(scaffoldKey),
    resetScaffold: () =>
      useUIStore.getState().resetScaffoldCompletions?.(),
  };
}

/**
 * useScaffoldDismissal: Progressive exposure hook implementing the "Scaffold & Fade" doctrine.
 * Prompts and guided banners show for Day 0-7 onboarding and gracefully fade out after
 * repeated successful completions (default 3), transitioning the user into operational mastery.
 */
export function useScaffoldDismissal(
  scaffoldKey: string,
  maxCompletions: number = 3,
): UseScaffoldDismissalResult {
  const completionCount = useUIStore(
    (state) => state.scaffoldCompletions?.[scaffoldKey] ?? 0,
  );
  const increment = useUIStore((state) => state.incrementScaffoldCompletion);
  const reset = useUIStore((state) => state.resetScaffoldCompletions);

  const completeScaffold = useCallback(() => {
    increment?.(scaffoldKey);
  }, [increment, scaffoldKey]);

  const resetScaffold = useCallback(() => {
    reset?.();
  }, [reset]);

  return {
    isDismissed: completionCount >= maxCompletions,
    completionCount,
    completeScaffold,
    resetScaffold,
  };
}
