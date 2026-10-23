import type { Query, QueryClient } from '@tanstack/react-query';

export type PersistedRecordScope =
  | 'device'
  | 'explore'
  | 'principal'
  | 'tenant'
  | 'bond'
  | 'perspective'
  | 'route';

export type PersistedRecordSensitivity =
  | 'public'
  | 'preference'
  | 'personal'
  | 'authorization'
  | 'security'
  | 'regulated';

export interface PersistedRecord<T> {
  readonly schemaVersion: number;
  readonly scope: PersistedRecordScope;
  readonly writtenAt: number;
  readonly payload: T;
}

export interface PersistedRecordPolicy<T> {
  readonly key: string;
  readonly schemaVersion: number;
  readonly scope: PersistedRecordScope;
  readonly sensitivity: PersistedRecordSensitivity;
  readonly maxAgeMs?: number;
  readonly validate: (value: unknown) => value is T;
  readonly migrate?: (value: unknown, fromVersion: number) => T | null;
}

export type PersistedRecordRestore<T> =
  | { readonly kind: 'restored'; readonly record: PersistedRecord<T>; readonly migrated: boolean }
  | { readonly kind: 'missing' }
  | { readonly kind: 'corrupt' }
  | { readonly kind: 'expired' }
  | { readonly kind: 'migration-failed' };

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

function isPersistedRecord(value: unknown): value is PersistedRecord<unknown> {
  return (
    isObject(value) &&
    typeof value.schemaVersion === 'number' &&
    Number.isInteger(value.schemaVersion) &&
    value.schemaVersion >= 1 &&
    typeof value.scope === 'string' &&
    typeof value.writtenAt === 'number' &&
    Number.isFinite(value.writtenAt) &&
    'payload' in value
  );
}

/**
 * Wraps a payload with its schema and retention metadata. Store adoption is
 * intentionally a later migration step; this contract is pure and testable.
 */
export function createPersistedRecord<T>(
  payload: T,
  policy: PersistedRecordPolicy<T>,
  writtenAt = Date.now(),
): PersistedRecord<T> {
  if (!policy.validate(payload)) {
    throw new Error(`Persisted record "${policy.key}" rejected its payload.`);
  }
  if (!Number.isInteger(policy.schemaVersion) || policy.schemaVersion < 1) {
    throw new Error(`Persisted record "${policy.key}" requires a positive schema version.`);
  }
  return { schemaVersion: policy.schemaVersion, scope: policy.scope, writtenAt, payload };
}

/**
 * Restores a record without throwing on browser/native storage corruption.
 * Callers select their fallback UI/state based on the explicit result.
 */
export function restorePersistedRecord<T>(
  serialized: string | null | undefined,
  policy: PersistedRecordPolicy<T>,
  now = Date.now(),
): PersistedRecordRestore<T> {
  if (serialized === null || serialized === undefined) return { kind: 'missing' };

  let parsed: unknown;
  try {
    parsed = JSON.parse(serialized);
  } catch {
    return { kind: 'corrupt' };
  }
  if (!isPersistedRecord(parsed) || parsed.scope !== policy.scope) return { kind: 'corrupt' };
  if (policy.maxAgeMs !== undefined && now - parsed.writtenAt > policy.maxAgeMs) {
    return { kind: 'expired' };
  }

  if (parsed.schemaVersion === policy.schemaVersion) {
    return policy.validate(parsed.payload)
      ? { kind: 'restored', record: parsed as PersistedRecord<T>, migrated: false }
      : { kind: 'corrupt' };
  }
  if (!policy.migrate) return { kind: 'migration-failed' };

  const migrated = policy.migrate(parsed.payload, parsed.schemaVersion);
  if (migrated === null || !policy.validate(migrated)) return { kind: 'migration-failed' };
  return {
    kind: 'restored',
    record: createPersistedRecord(migrated, policy, parsed.writtenAt),
    migrated: true,
  };
}

export interface QueryScope {
  readonly principalId: string;
  readonly tenantId?: string;
  readonly bondId?: string;
  readonly perspectiveId?: string;
}

type QueryScopePrefix = readonly ['scope', string, string | null, string | null, string | null];

function normalizedScopeSegment(value: string | undefined, label: string): string | null {
  if (value === undefined) return null;
  const normalized = value.trim();
  if (!normalized) throw new Error(`Query scope ${label} must not be empty.`);
  return normalized;
}

/** A stable Query-key namespace for new private resource families. */
export function queryScopePrefix(scope: QueryScope): QueryScopePrefix {
  return [
    'scope',
    normalizedScopeSegment(scope.principalId, 'principalId')!,
    normalizedScopeSegment(scope.tenantId, 'tenantId'),
    normalizedScopeSegment(scope.bondId, 'bondId'),
    normalizedScopeSegment(scope.perspectiveId, 'perspectiveId'),
  ];
}

export function scopedQueryKey<T extends readonly unknown[]>(
  scope: QueryScope,
  resourceKey: T,
): readonly [...QueryScopePrefix, ...T] {
  return [...queryScopePrefix(scope), ...resourceKey];
}

function queryMatchesScope(query: Query, prefix: QueryScopePrefix): boolean {
  const key = query.queryKey;
  return prefix.every((segment, index) => key[index] === segment);
}

export interface QueryScopeDisposalResult {
  readonly scope: QueryScopePrefix;
  readonly matchedQueryCount: number;
}

export interface QueryScopeInvalidationResult {
  readonly scope: QueryScopePrefix;
  readonly matchedQueryCount: number;
}

/**
 * Cancels and removes only queries bearing the supplied scope prefix. It never
 * calls `QueryClient.clear()` and deliberately leaves mutations/outbox state to
 * the command lifecycle owner.
 */
export async function disposeQueryScope(
  queryClient: QueryClient,
  scope: QueryScope,
): Promise<QueryScopeDisposalResult> {
  const prefix = queryScopePrefix(scope);
  const predicate = (query: Query) => queryMatchesScope(query, prefix);
  const matchedQueryCount = queryClient.getQueryCache().findAll({ predicate }).length;
  await queryClient.cancelQueries({ predicate });
  queryClient.removeQueries({ predicate });
  return { scope: prefix, matchedQueryCount };
}

/**
 * Marks only a scoped resource family stale without removing its cached data.
 * `refetchType: 'none'` prevents a scope transition utility from implicitly
 * starting network work; the owning screen chooses when to refetch.
 */
export async function invalidateQueryScope(
  queryClient: QueryClient,
  scope: QueryScope,
): Promise<QueryScopeInvalidationResult> {
  const prefix = queryScopePrefix(scope);
  const predicate = (query: Query) => queryMatchesScope(query, prefix);
  const matchedQueryCount = queryClient.getQueryCache().findAll({ predicate }).length;
  await queryClient.invalidateQueries({ predicate, refetchType: 'none' });
  return { scope: prefix, matchedQueryCount };
}

export type StateRegistryClass =
  | 'scope-session'
  | 'server-state-candidate'
  | 'durable-command'
  | 'protocol-candidate'
  | 'navigation-handoff'
  | 'device-preference'
  | 'scoped-preference'
  | 'shared-client'
  | 'domain-projection-review';

export interface StateRegistryEntry {
  readonly id: string;
  readonly source: string;
  readonly owner: string;
  readonly stateClass: StateRegistryClass;
  readonly scope: PersistedRecordScope | 'component';
  readonly disposition:
    | 'retain'
    | 'query-review'
    | 'scope-session-review'
    | 'protocol-review'
    | 'split-review';
}

/**
 * Audit-only registry. It has no runtime authority and does not import stores;
 * that prevents this foundation from becoming another global state mechanism.
 */
export const CLIENT_STATE_REGISTRY = [
  {
    id: 'auth',
    source: 'packages/core/src/store/useAuthStore.ts',
    owner: 'identity',
    stateClass: 'scope-session',
    scope: 'principal',
    disposition: 'scope-session-review',
  },
  {
    id: 'tenant',
    source: 'packages/core/src/store/useTenantStore.ts',
    owner: 'identity',
    stateClass: 'scope-session',
    scope: 'tenant',
    disposition: 'scope-session-review',
  },
  {
    id: 'perspective',
    source: 'packages/core/src/store/usePerspectiveStore.ts',
    owner: 'identity',
    stateClass: 'scope-session',
    scope: 'perspective',
    disposition: 'scope-session-review',
  },
  {
    id: 'feature',
    source: 'packages/core/src/store/useFeatureStore.ts',
    owner: 'platform',
    stateClass: 'server-state-candidate',
    scope: 'principal',
    disposition: 'query-review',
  },
  {
    id: 'entitlement',
    source: 'packages/core/src/store/useEntitlementStore.ts',
    owner: 'authorization',
    stateClass: 'server-state-candidate',
    scope: 'principal',
    disposition: 'query-review',
  },
  {
    id: 'cedar-decision',
    source: 'packages/core/src/store/useCedarDecisionStore.ts',
    owner: 'authorization',
    stateClass: 'server-state-candidate',
    scope: 'perspective',
    disposition: 'query-review',
  },
  {
    id: 'notification',
    source: 'packages/core/src/store/useNotificationStore.ts',
    owner: 'notification-domain',
    stateClass: 'server-state-candidate',
    scope: 'principal',
    disposition: 'query-review',
  },
  {
    id: 'device-security',
    source: 'packages/core/src/store/useDeviceSecurityStore.ts',
    owner: 'security',
    stateClass: 'server-state-candidate',
    scope: 'principal',
    disposition: 'query-review',
  },
  {
    id: 'conflict',
    source: 'packages/core/src/store/useConflictStore.ts',
    owner: 'sync-domain',
    stateClass: 'durable-command',
    scope: 'principal',
    disposition: 'retain',
  },
  {
    id: 'mutation-queue',
    source: 'packages/core/src/lib/sync/useMutationQueue.ts',
    owner: 'sync-domain',
    stateClass: 'durable-command',
    scope: 'principal',
    disposition: 'retain',
  },
  {
    id: 'mutation-audit-log',
    source: 'packages/core/src/lib/sync/MutationAuditLog.ts',
    owner: 'sync-domain',
    stateClass: 'durable-command',
    scope: 'principal',
    disposition: 'retain',
  },
  {
    id: 'version-gating',
    source: 'packages/core/src/lib/sync/versionGating.ts',
    owner: 'sync-domain',
    stateClass: 'protocol-candidate',
    scope: 'device',
    disposition: 'protocol-review',
  },
  {
    id: 'pending-intent',
    source: 'packages/core/src/logic/deeplink/pendingIntentStore.ts',
    owner: 'navigation',
    stateClass: 'navigation-handoff',
    scope: 'route',
    disposition: 'retain',
  },
  {
    id: 'consent',
    source: 'packages/core/src/store/useConsentStore.ts',
    owner: 'privacy',
    stateClass: 'device-preference',
    scope: 'device',
    disposition: 'retain',
  },
  {
    id: 'ui',
    source: 'packages/core/src/store/useUIStore.ts',
    owner: 'ui-platform',
    stateClass: 'device-preference',
    scope: 'device',
    disposition: 'retain',
  },
  {
    id: 'drafts',
    source: 'packages/core/src/store/useDraftsStore.ts',
    owner: 'workspace-domain',
    stateClass: 'scoped-preference',
    scope: 'principal',
    disposition: 'split-review',
  },
  {
    id: 'active-subtabs',
    source: 'packages/core/src/store/useActiveSubTabsStore.ts',
    owner: 'workbench',
    stateClass: 'scoped-preference',
    scope: 'principal',
    disposition: 'retain',
  },
  {
    id: 'growth',
    source: 'packages/core/src/store/useGrowthStore.ts',
    owner: 'growth-domain',
    stateClass: 'domain-projection-review',
    scope: 'principal',
    disposition: 'split-review',
  },
  {
    id: 'temporal',
    source: 'packages/core/src/store/useTemporalStore.ts',
    owner: 'temporal-domain',
    stateClass: 'shared-client',
    scope: 'component',
    disposition: 'retain',
  },
  {
    id: 'self-canvas',
    source: 'packages/self/src/features/selfCanvasStore.ts',
    owner: 'self-domain',
    stateClass: 'scoped-preference',
    scope: 'principal',
    disposition: 'split-review',
  },
] as const satisfies readonly StateRegistryEntry[];

export interface ProtocolAdmissionInput {
  readonly name: string;
  readonly meaningfulStateGraph: boolean;
  readonly survivesInterruption: boolean;
  readonly transitionGuardsImproveSafety: boolean;
  readonly effectOwnersNamed: boolean;
  readonly machineTestsImproveEvidence: boolean;
}

export type ProtocolAdmission =
  | { readonly admitted: true; readonly name: string }
  | { readonly admitted: false; readonly name: string; readonly blockers: readonly string[] };

/** Applies the canonical XState admission test without importing XState. */
export function assessProtocolAdmission(input: ProtocolAdmissionInput): ProtocolAdmission {
  const blockers = [
    !input.meaningfulStateGraph && 'no meaningful guarded state graph',
    !input.survivesInterruption && 'no defined interruption or recovery semantics',
    !input.transitionGuardsImproveSafety && 'transition table does not improve safety',
    !input.effectOwnersNamed && 'effect, timeout, or cancellation owners are unnamed',
    !input.machineTestsImproveEvidence && 'machine tests add no evidence beyond direct tests',
  ].filter((blocker): blocker is string => Boolean(blocker));
  return blockers.length === 0
    ? { admitted: true, name: input.name }
    : { admitted: false, name: input.name, blockers };
}
