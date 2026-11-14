let activeAccountId: string | null = null;
let accountScopeRevision = 0;

const ANONYMOUS_SCOPE = 'anonymous';

export function getActiveAccountId(): string | null {
  return activeAccountId;
}

export function setActiveAccountId(accountId: string | null) {
  if (activeAccountId !== accountId) accountScopeRevision += 1;
  activeAccountId = accountId;
}

export function getAccountScopeRevision(): number {
  return accountScopeRevision;
}

export function getActiveAccountScope(): string {
  return activeAccountId ?? ANONYMOUS_SCOPE;
}

export function scopeStorageKey(name: string, accountId: string | null = activeAccountId): string {
  const scope = accountId ?? ANONYMOUS_SCOPE;
  return `gurudevi:${scope}:${name}`;
}
