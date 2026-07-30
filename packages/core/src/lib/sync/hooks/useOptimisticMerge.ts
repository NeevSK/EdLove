/**
 * useOptimisticMerge — Read-Write Cache Reconciliation (May 2026)
 *
 * Closes Loophole 4: "Read-Resilience disconnected from Write-Resilience"
 *
 * PROBLEM:
 *   `withResilience` (SWR cache) reads stale data.
 *   `useMutationQueue` has the "truth" — pending writes not yet synced.
 *   The user sees their OWN changes disappear until the sync completes.
 *
 * SOLUTION:
 *   This hook lets a screen merge pending queue items into a cached snapshot
 *   so the UI always reflects "what the user intended" even while offline.
 *
 * USAGE:
 *   const attendance = useOptimisticMerge({
 *     data: cachedAttendanceList,
 *     scope: 'classroom',
 *     mutationName: 'updateAttendance',
 *     // Describes how to apply a pending mutation to the local snapshot
 *     apply: (current, vars) =>
 *       current.map(r => r.studentId === vars.studentId
 *         ? { ...r, status: vars.status, _optimistic: true }
 *         : r
 *       ),
 *   });
 */
import { useMemo } from 'react';
import { useMutationQueue } from '@repo/core/lib/sync/useMutationQueue';

interface UseOptimisticMergeOptions<T> {
  /** The data snapshot returned from `withResilience` or React Query */
  data: T;
  /** The mutation scope to filter queue items by (e.g. 'classroom') */
  scope?: string;
  /** The mutation name(s) to filter queue items by (e.g. 'updateAttendance') */
  mutationName: string | string[];
  /**
   * Pure function: given the current data and a pending mutation's variables,
   * return the new optimistically-merged data.
   *
   * Must be a pure function — no side effects.
   */
  apply: (current: T, variables: any) => T;
}

/**
 * Returns the data with all pending queue mutations speculatively applied.
 * The result is memoised — it only re-computes when the queue or data changes.
 *
 * NOTE: Items marked `_optimistic: true` can be used in the UI to show a
 * pending indicator (spinner, greyed-out row, etc.).
 */
export function useOptimisticMerge<T>({
  data,
  scope,
  mutationName,
  apply,
}: UseOptimisticMergeOptions<T>): T {
  const queue = useMutationQueue((s) => s.queue);

  return useMemo(() => {
    const names = Array.isArray(mutationName) ? mutationName : [mutationName];

    // Find all pending mutations that match this screen's scope + name
    const relevantMutations = queue.filter((m) => {
      const nameMatch = names.includes(m.name);
      const scopeMatch = scope ? m.scope === scope : true;
      return nameMatch && scopeMatch;
    });

    if (relevantMutations.length === 0) return data;

    // Fold each pending mutation into the snapshot in chronological order
    return relevantMutations
      .sort((a, b) => a.timestamp - b.timestamp)
      .reduce((acc, mutation) => {
        try {
          return apply(acc, mutation.variables);
        } catch {
          // If the apply function throws (e.g. data shape mismatch), skip it
          return acc;
        }
      }, data);
  }, [data, queue, scope, mutationName, apply]);
}
