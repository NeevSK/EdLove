import {
  createPersistenceIdentity,
  derivePersistenceKey,
  resolvePersistenceWriteDecision,
  type PersistenceIdentity,
  type PersistenceWriteDecision,
} from './persistenceBoundary';

export type AccountPracticeScope = Readonly<{
  identity: PersistenceIdentity;
  featureId: string;
  workspaceId: string;
}>;

function requiredSegment(value: string, label: string): string {
  const normalized = value.trim();
  if (!normalized) throw new Error(`Practice ${label} must not be empty.`);
  return normalized;
}

/** Creates an account-owned but device-local identity for one feature practice workspace. */
export function createAccountPracticeScope(input: {
  accountId: string;
  featureId: string;
  workspaceId: string;
}): AccountPracticeScope {
  return {
    identity: createPersistenceIdentity({
      experience: 'sandbox',
      principal: { kind: 'account', id: input.accountId },
    }),
    featureId: requiredSegment(input.featureId, 'feature id'),
    workspaceId: requiredSegment(input.workspaceId, 'workspace id'),
  };
}

/** Adds a record key below the account + feature + practice-workspace namespace. */
export function deriveAccountPracticeKey(scope: AccountPracticeScope, key: string): string {
  const segments = [scope.featureId, scope.workspaceId, requiredSegment(key, 'key')].map(
    (segment) => encodeURIComponent(segment),
  );
  return derivePersistenceKey(scope.identity, `practice:${segments.join(':')}`);
}

/** Practice storage is local; production dispatch must remain denied. */
export function resolveAccountPracticeWriteDecision(
  scope: AccountPracticeScope,
  target: 'local' | 'production',
): PersistenceWriteDecision {
  return resolvePersistenceWriteDecision(scope.identity, target);
}
