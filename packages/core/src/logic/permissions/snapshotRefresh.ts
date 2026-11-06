import { getDrizzleDB } from '@repo/core/adapters/powersync/database';
import type { AppContractClient } from '@repo/core/api/v1/contract';
import { sovereignBus } from '@repo/core/lib/sync/eventBus';
import { type ScopeSessionSnapshot, useScopeSessionStore } from '@repo/core/store/scopeSession';
import { permissionScopeId } from '@repo/core/store/scopeSessionCoordinator';
import { useCedarDecisionStore } from '@repo/core/store/useCedarDecisionStore';
import { sql } from 'drizzle-orm';

// Refresh an hour before expiry; retry failures after five minutes.
const REFRESH_LEAD_MS = 60 * 60 * 1000;
const RETRY_MS = 5 * 60 * 1000;
const MIN_DELAY_MS = 60 * 1000;

type IssuedSnapshot = Awaited<ReturnType<AppContractClient['authority']['refreshSnapshot']>>;

/** Keeps the signed row on the device, so permissions survive a restart with no network. */
async function storeSnapshot(issued: IssuedSnapshot) {
  const db = getDrizzleDB();
  const id = `${issued.userId}:${issued.activeBondId}`;
  await db.transaction(async (tx) => {
    await tx.run(sql`delete from permission_snapshots where id = ${id}`);
    await tx.run(sql`insert into permission_snapshots
      (id, user_id, active_bond_id, active_entity_id, active_entity_type, school_id, policy_version,
       generated_at, expires_at, permissions, temporal_hints, signature)
      values (${id}, ${issued.userId}, ${issued.activeBondId}, ${issued.activeEntityId},
       ${issued.activeEntityType}, ${issued.schoolId}, ${issued.policyVersion}, ${issued.generatedAt},
       ${issued.expiresAt}, ${JSON.stringify(issued.permissions)}, ${JSON.stringify(issued.temporalHints)},
       ${issued.signature})`);
    await tx.run(sql`delete from policy_version where id = 'cedar'`);
    await tx.run(sql`insert into policy_version (id, hash, updated_at)
      values ('cedar', ${issued.policyVersion}, ${issued.generatedAt})`);
  });
}

/**
 * Keeps the active bond's offline permission snapshot fresh: asks the server for a new
 * one whenever a scope session commits and again before it expires, stores the signed
 * row, then reloads the local decisions. The device never trusts the response itself:
 * useCedarDecisionStore verifies the signature on the stored row before using it.
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
      await storeSnapshot(issued);
      if (current() !== scope) return;
      await useCedarDecisionStore.getState().loadDecisions(scope.principalId, permissionScopeId(scope));
      // Sync may later deliver a newer row for this scope.
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
