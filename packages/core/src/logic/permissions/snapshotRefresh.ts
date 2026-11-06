import type { AppContractClient } from '@repo/core/api/v1/contract';
import { sovereignBus } from '@repo/core/lib/sync/eventBus';
import { type ScopeSessionSnapshot, useScopeSessionStore } from '@repo/core/store/scopeSession';
import { permissionScopeId } from '@repo/core/store/scopeSessionCoordinator';
import { useCedarDecisionStore } from '@repo/core/store/useCedarDecisionStore';

// Refresh an hour before expiry; retry failures after five minutes.
const REFRESH_LEAD_MS = 60 * 60 * 1000;
const RETRY_MS = 5 * 60 * 1000;
const MIN_DELAY_MS = 60 * 1000;

/**
 * Keeps the active bond's offline permission snapshot fresh: asks the server for a new
 * one whenever a scope session commits and again before it expires, then reloads the
 * local decisions once sync has delivered the signed row. The device never trusts the
 * refresh response itself; useCedarDecisionStore verifies the synced row.
 *
 * Call once at app start with the app's authenticated v1 client; the returned function
 * stops it (sign-out, tests).
 */
export function startPermissionSnapshotRefresh(client: Pick<AppContractClient, 'authority'>) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  // The scope whose refreshed row we're waiting for sync to deliver.
  let awaitingSync: ScopeSessionSnapshot | null = null;

  const current = () => useScopeSessionStore.getState().snapshot;
  const schedule = (delay: number) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(
      () => {
        const scope = current();
        if (scope) void refresh(scope);
      },
      Math.max(delay, MIN_DELAY_MS),
    );
  };

  async function refresh(scope: ScopeSessionSnapshot) {
    const bond = scope.activeBond;
    if (!scope.principalId || !bond) return;
    try {
      const issued = await client.authority.refreshSnapshot({ bondId: bond.id });
      if (current() !== scope) return;
      awaitingSync = scope;
      schedule(Date.parse(issued.expiresAt) - Date.now() - REFRESH_LEAD_MS);
    } catch (error) {
      if (current() !== scope) return;
      const code = typeof error === 'object' && error && 'code' in error ? error.code : undefined;
      // Signed out or not allowed: retrying won't help until the scope changes.
      if (code === 'UNAUTHORIZED' || code === 'FORBIDDEN') return;
      console.warn('[PermissionSnapshot] Refresh failed; retrying.', code ?? 'unknown');
      schedule(RETRY_MS);
    }
  }

  const stopTransitions = sovereignBus.on('perspective:transition_completed', () => {
    if (timer) clearTimeout(timer);
    awaitingSync = null;
    const scope = current();
    if (scope) void refresh(scope);
  });
  const stopSync = sovereignBus.on('sync:completed', () => {
    const scope = awaitingSync;
    if (!scope?.principalId || current() !== scope) return;
    awaitingSync = null;
    void useCedarDecisionStore
      .getState()
      .loadDecisions(scope.principalId, permissionScopeId(scope));
  });

  // A scope may already be committed when this starts (a restored session).
  const initial = current();
  if (initial) void refresh(initial);

  return () => {
    stopTransitions();
    stopSync();
    if (timer) clearTimeout(timer);
  };
}
