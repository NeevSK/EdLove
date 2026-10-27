import { SupabaseEntitlementAdapter } from '@repo/core/adapters/supabase/supabaseEntitlement.adapter';
import { abortableQueryRead } from '@repo/core/lib/clientStateFoundation';
import { SafeZustandStorage } from '@repo/core/lib/storageWrapper';
import type {
  EntitlementGrant,
  EntitlementReadiness,
  EntitlementScopeContext,
  EntitlementSnapshot,
  SubscriptionTier,
} from '@repo/core/logic/ports/entitlement.port';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useReducer } from 'react';

export const ENTITLEMENT_SNAPSHOT_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const adapter = new SupabaseEntitlementAdapter();

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

const normalizeIdentity = (
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

function isIdentity(value: unknown, identity: EntitlementIdentity): value is EntitlementIdentity {
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

function isGrantCurrent(grant: EntitlementGrant, now: number): boolean {
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
  const raw = await SafeZustandStorage.getItem(storageKey(identity));
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
  await SafeZustandStorage.setItem(storageKey(identity), JSON.stringify({ identity, snapshot }));
}

async function readEntitlements(
  identity: EntitlementIdentity,
  signal: AbortSignal,
): Promise<QualifiedEntitlementSnapshot> {
  try {
    const snapshot = await abortableQueryRead(signal, () =>
      adapter.getEntitlements(identity.principalId, {
        activeBondId: identity.activeBondId,
        activeEntityId: identity.activeEntityId,
        activeEntityType: identity.activeEntityType,
      }),
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

export function useEntitlementQuery(
  principalId: string | null,
  scope: EntitlementScopeContext,
  enabled: boolean,
) {
  const identity = principalId ? normalizeIdentity(principalId, scope) : null;
  const query = useQuery<
    QualifiedEntitlementSnapshot,
    Error,
    QualifiedEntitlementSnapshot,
    readonly unknown[]
  >({
    ...(identity
      ? createEntitlementQueryOptions(identity)
      : { queryKey: ['capability', 'entitlement', 'disabled'] as const }),
    enabled: enabled && identity !== null,
  });

  const [, observeExpiry] = useReducer((revision: number) => revision + 1, 0);
  const now = Date.now();
  const snapshot = query.data;
  useEffect(() => {
    if (!enabled || !snapshot || !isEntitlementSnapshotFresh(snapshot.refreshedAt, now)) return;
    const boundaries = [
      Date.parse(snapshot.refreshedAt ?? '') + ENTITLEMENT_SNAPSHOT_MAX_AGE_MS,
      Date.parse(snapshot.expirationDate ?? ''),
      ...(snapshot.grants ?? []).flatMap((grant) => [
        Date.parse(grant.startsAt ?? ''),
        Date.parse(grant.expiresAt ?? ''),
      ]),
    ].filter((boundary) => Number.isFinite(boundary) && boundary > now);
    if (boundaries.length === 0) return;
    const timer = setTimeout(observeExpiry, Math.min(...boundaries) - now);
    return () => clearTimeout(timer);
  }, [enabled, snapshot, now]);

  const data =
    enabled &&
    snapshot &&
    identity &&
    isIdentity(snapshot.identity, identity) &&
    isEntitlementSnapshotFresh(snapshot.refreshedAt, now)
      ? snapshot
      : null;
  const planCurrent =
    data?.expirationDate === null ||
    (data?.expirationDate !== undefined && Date.parse(data.expirationDate) > now);
  const readiness: EntitlementReadiness =
    data?.readiness ?? (query.isFetching ? 'loading' : query.isError ? 'error' : 'unknown');
  return {
    activeEntitlements: planCurrent ? (data?.activeEntitlements ?? []) : [],
    grants: (data?.grants ?? []).filter((grant) => isGrantCurrent(grant, now)),
    pricingTier: (planCurrent ? (data?.pricingTier ?? 'FREE') : 'FREE') as SubscriptionTier,
    manifestLoaded: data !== null,
    readiness,
    snapshotRefreshedAt: data?.refreshedAt ?? null,
    snapshotUserId: data?.identity.principalId ?? null,
    isLoading: query.isFetching,
    error: data?.refreshError ?? (query.error instanceof Error ? query.error.message : null),
    refetch: query.refetch,
    data,
  };
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
