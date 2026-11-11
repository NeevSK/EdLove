/**
 * Entitlements as server state (Tier 4): the TanStack Query definition, its offline cache and the
 * read through EntitlementPort. The hook that screens use is hooks/useEntitlementQuery.ts.
 */
import { callPort } from '@repo/core/effect/AppRuntime';
import { persistStorage } from '@repo/core/effect/bindings';
import { abortableQueryRead } from '@repo/core/lib/clientStateFoundation';
import {
  type EntitlementGrant,
  EntitlementPort,
  type EntitlementReadiness,
  type EntitlementScopeContext,
  type EntitlementSnapshot,
} from '@repo/core/logic/ports/entitlement.port';

export const ENTITLEMENT_SNAPSHOT_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export type EntitlementIdentity = {
  principalId: string;
  activeBondId: string | null;
  activeEntityId: string | null;
  activeEntityType: string | null;
};

export type QualifiedEntitlementSnapshot = EntitlementSnapshot & {
  identity: EntitlementIdentity;
  readiness: EntitlementReadiness;
  refreshError: string | null;
};

export const normalizeIdentity = (
  principalId: string,
  scope: EntitlementScopeContext,
): EntitlementIdentity => ({
  principalId,
  activeBondId: scope.activeBondId ?? null,
  activeEntityId: scope.activeEntityId ?? null,
  activeEntityType: scope.activeEntityType ?? null,
});

export function entitlementQueryKey(identity: EntitlementIdentity) {
  return [
    'capability',
    'entitlement',
    identity.principalId,
    identity.activeBondId,
    identity.activeEntityId,
    identity.activeEntityType,
  ] as const;
}

function storageKey(identity: EntitlementIdentity) {
  return `gurudevi-entitlement-query:${encodeURIComponent(JSON.stringify(identity))}`;
}

export function isIdentity(
  value: unknown,
  identity: EntitlementIdentity,
): value is EntitlementIdentity {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<EntitlementIdentity>;
  return (
    candidate.principalId === identity.principalId &&
    candidate.activeBondId === identity.activeBondId &&
    candidate.activeEntityId === identity.activeEntityId &&
    candidate.activeEntityType === identity.activeEntityType
  );
}

export function isEntitlementSnapshotFresh(refreshedAt: string | undefined, now = Date.now()) {
  if (!refreshedAt) return false;
  const refreshed = Date.parse(refreshedAt);
  return (
    Number.isFinite(refreshed) &&
    refreshed <= now &&
    now - refreshed < ENTITLEMENT_SNAPSHOT_MAX_AGE_MS
  );
}

export function isGrantCurrent(grant: EntitlementGrant, now: number): boolean {
  const startsAt = grant.startsAt === undefined ? null : Date.parse(grant.startsAt);
  const expiresAt = grant.expiresAt === null ? null : Date.parse(grant.expiresAt);
  return (
    grant.status === 'ACTIVE' &&
    (startsAt === null || (Number.isFinite(startsAt) && startsAt <= now)) &&
    (expiresAt === null || (Number.isFinite(expiresAt) && expiresAt > now))
  );
}

function isSnapshot(value: unknown): value is EntitlementSnapshot {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<EntitlementSnapshot>;
  return (
    (candidate.pricingTier === 'FREE' ||
      candidate.pricingTier === 'PRO' ||
      candidate.pricingTier === 'INSTITUTIONAL') &&
    Array.isArray(candidate.activeEntitlements) &&
    (candidate.expirationDate === null ||
      (typeof candidate.expirationDate === 'string' &&
        Number.isFinite(Date.parse(candidate.expirationDate)))) &&
    candidate.activeEntitlements.every((item) => typeof item === 'string') &&
    (candidate.grants === undefined ||
      (Array.isArray(candidate.grants) &&
        candidate.grants.every((grant) => {
          if (typeof grant !== 'object' || grant === null) return false;
          const item = grant as Partial<EntitlementGrant>;
          return (
            typeof item.id === 'string' &&
            (item.scope === 'individual' ||
              item.scope === 'active_bond' ||
              item.scope === 'active_entity' ||
              item.scope === 'add_on') &&
            (item.scopeId === null || typeof item.scopeId === 'string') &&
            (item.tier === 'FREE' || item.tier === 'PRO' || item.tier === 'INSTITUTIONAL') &&
            Array.isArray(item.modules) &&
            item.modules.every((module) => typeof module === 'string') &&
            (item.startsAt === undefined || typeof item.startsAt === 'string') &&
            (item.expiresAt === null || typeof item.expiresAt === 'string') &&
            (item.status === 'ACTIVE' || item.status === 'SUSPENDED' || item.status === 'REVOKED')
          );
        })))
  );
}

async function readCached(
  identity: EntitlementIdentity,
): Promise<QualifiedEntitlementSnapshot | null> {
  const raw = await persistStorage.getItem(storageKey(identity));
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return null;
    const record = parsed as { identity?: unknown; snapshot?: unknown };
    if (!isIdentity(record.identity, identity) || !isSnapshot(record.snapshot)) return null;
    if (!isEntitlementSnapshotFresh(record.snapshot.refreshedAt)) return null;
    return {
      ...record.snapshot,
      identity,
      readiness: 'cached',
      refreshError: null,
    };
  } catch {
    return null;
  }
}

async function persistSnapshot(
  identity: EntitlementIdentity,
  snapshot: EntitlementSnapshot,
): Promise<void> {
  if (!isEntitlementSnapshotFresh(snapshot.refreshedAt)) return;
  await persistStorage.setItem(storageKey(identity), JSON.stringify({ identity, snapshot }));
}

async function readEntitlements(
  identity: EntitlementIdentity,
  signal: AbortSignal,
): Promise<QualifiedEntitlementSnapshot> {
  try {
    const snapshot = await abortableQueryRead(signal, () =>
      callPort(EntitlementPort, (port) =>
        port.getEntitlements(identity.principalId, {
          activeBondId: identity.activeBondId,
          activeEntityId: identity.activeEntityId,
          activeEntityType: identity.activeEntityType,
        }),
      ),
    );
    if (!isSnapshot(snapshot) || !isEntitlementSnapshotFresh(snapshot.refreshedAt)) {
      throw new Error('Entitlement response has invalid snapshot metadata.');
    }
    const qualified = { ...snapshot, identity, readiness: 'verified' as const, refreshError: null };
    await persistSnapshot(identity, snapshot).catch((error: unknown) => {
      console.warn('[Entitlements] Offline snapshot could not be retained.', error);
    });
    return qualified;
  } catch (error) {
    if (signal.aborted) throw error;
    const cached = await readCached(identity);
    if (cached) {
      return {
        ...cached,
        refreshError: error instanceof Error ? error.message : String(error),
      };
    }
    throw error;
  }
}

export function createEntitlementQueryOptions(identity: EntitlementIdentity) {
  return {
    queryKey: entitlementQueryKey(identity),
    queryFn: ({ signal }: { signal: AbortSignal }) => readEntitlements(identity, signal),
    staleTime: 0,
    gcTime: ENTITLEMENT_SNAPSHOT_MAX_AGE_MS,
    networkMode: 'offlineFirst',
    retry: 0,
  } as const;
}
