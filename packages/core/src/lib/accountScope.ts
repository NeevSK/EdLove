let activeAccountId: string | null = null;

const ANONYMOUS_SCOPE = 'anonymous';

export function getActiveAccountId(): string | null {
  return activeAccountId;
}

export function setActiveAccountId(accountId: string | null) {
  activeAccountId = accountId;
}

export function getActiveAccountScope(): string {
  return activeAccountId ?? ANONYMOUS_SCOPE;
}

export function scopeStorageKey(name: string, accountId: string | null = activeAccountId): string {
  const scope = accountId ?? ANONYMOUS_SCOPE;
  return `gurudevi:${scope}:${name}`;
}
