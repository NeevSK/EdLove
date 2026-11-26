import { disposeAccountBoundaryQueries } from '@repo/core/lib/clientStateFoundation';
import { useScopeSessionStore } from '@repo/core/store/scopeSession';
import type { QueryClient } from '@tanstack/react-query';

/**
 * Keeps one account's cached query data from being shown to the next.
 *
 * Whenever the signed-in account (the scope session's principal) changes, the outgoing
 * account's scoped queries and all unscoped (legacy) queries are cancelled and removed, before
 * React renders the new account. Queued writes (the MutationCache and the outbox) are left alone:
 * the account transition decides whether they pause or drop.
 *
 * Call once where the app creates its QueryClient; returns the unsubscribe. Web does the same
 * from `AuthQueryCacheBoundary`.
 */
export function bindQueryCacheToAccount(
  queryClient: QueryClient,
  onError: (error: unknown) => void = () => {},
): () => void {
  return useScopeSessionStore.subscribe((state, previous) => {
    const outgoing = previous.snapshot?.principalId ?? null;
    const incoming = state.snapshot?.principalId ?? null;
    if (outgoing === incoming) return;
    disposeAccountBoundaryQueries(queryClient, outgoing).catch(onError);
  });
}
