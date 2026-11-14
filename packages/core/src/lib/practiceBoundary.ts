import {
  createPersistenceIdentity,
  derivePersistenceKey,
  type PersistenceIdentity,
  type PersistenceWriteDecision,
  resolvePersistenceWriteDecision,
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

export function createAccountPracticeDocumentScope(input: {
  accountId: string;
  featureId: string;
  documentId: string;
}): AccountPracticeScope {
  return createAccountPracticeScope({ ...input, workspaceId: input.documentId });
}

export function deriveAccountPracticeDocumentKey(scope: AccountPracticeScope): string {
  return deriveAccountPracticeKey(scope, 'state');
}

export function deriveAccountPracticeIndexKey(accountId: string): string {
  const identity = createPersistenceIdentity({
    experience: 'sandbox',
    principal: { kind: 'account', id: accountId },
  });
  return derivePersistenceKey(identity, 'practice:index');
}

export function deriveAccountPracticeLegacyDismissalKey(scope: AccountPracticeScope): string {
  return deriveAccountPracticeKey(scope, 'legacy-dismissed');
}

/** Practice storage is local; production dispatch must remain denied. */
export function resolveAccountPracticeWriteDecision(
  scope: AccountPracticeScope,
  target: 'local' | 'production',
): PersistenceWriteDecision {
  return resolvePersistenceWriteDecision(scope.identity, target);
}
