let activeAccountId: string | null = null;

const GUEST_SCOPE = 'guest';

export function getActiveAccountId(): string | null {
    return activeAccountId;
}

export function setActiveAccountId(accountId: string | null) {
    activeAccountId = accountId;
}

export function getActiveAccountScope(): string {
    return activeAccountId ?? GUEST_SCOPE;
}

export function scopeStorageKey(name: string, accountId: string | null = activeAccountId): string {
    const scope = accountId ?? GUEST_SCOPE;
    return `gurudevi:${scope}:${name}`;
}
