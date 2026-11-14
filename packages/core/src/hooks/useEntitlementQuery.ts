import type {
  EntitlementReadiness,
  EntitlementScopeContext,
  SubscriptionTier,
} from '@repo/core/logic/ports/entitlement.port';
import {
  createEntitlementQueryOptions,
  ENTITLEMENT_SNAPSHOT_MAX_AGE_MS,
  isEntitlementSnapshotFresh,
  isGrantCurrent,
  isIdentity,
  normalizeIdentity,
  type QualifiedEntitlementSnapshot,
} from '@repo/core/store/queries/entitlementQuery';
import { skipToken, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

export function useEntitlementQuery(
  principalId: string | null,
  scope: EntitlementScopeContext,
  enabled: boolean,
) {
  const identity = enabled && principalId ? normalizeIdentity(principalId, scope) : null;
  const query = useQuery<
    QualifiedEntitlementSnapshot,
    Error,
    QualifiedEntitlementSnapshot,
    readonly unknown[]
  >({
    ...(identity
      ? createEntitlementQueryOptions(identity)
      : { queryKey: ['capability', 'entitlement', 'disabled'] as const, queryFn: skipToken }),
    enabled: enabled && identity !== null,
  });

  // "Now" without reading the clock during render: the time at mount, the time this data was
  // fetched, and a timer that advances it at the next boundary where the plan, a grant or the
  // snapshot itself expires.
  const [clock, setClock] = useState(() => Date.now());
  const now = Math.max(clock, query.dataUpdatedAt);
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
    const timer = setTimeout(() => setClock(Date.now()), Math.min(...boundaries) - now);
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
