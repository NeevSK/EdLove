/** Namespace for the currently active anonymous identity's local data. */
let activeGuestUserId = 'anonymous';
let guestScopeRevision = 0;

export function setGuestScope(userId: string | null): void {
  const nextScope = userId ?? 'anonymous';
  if (activeGuestUserId !== nextScope) guestScopeRevision += 1;
  activeGuestUserId = nextScope;
}

export function getGuestScopeRevision(): number {
  return guestScopeRevision;
}

export function getGuestScope(): string {
  return activeGuestUserId;
}

export function guestStorageKey(name: string, userId: string = activeGuestUserId): string {
  return `guest:${userId}:${name}`;
}

/** Determines if a user ID represents an unauthenticated, anonymous, or sandbox guest. */
export function isGuestUserId(userId?: string | null): boolean {
  if (!userId) return true;
  if (
    userId === 'guest' ||
    userId === 'anonymous' ||
    userId === 'explore' ||
    userId === 'explore-local' ||
    userId.startsWith('guest:') ||
    userId.startsWith('local-')
  ) {
    return true;
  }
  return userId === activeGuestUserId;
}
