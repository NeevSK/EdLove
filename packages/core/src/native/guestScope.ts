/** Namespace for the currently active anonymous identity's local data. */
let activeGuestUserId = 'anonymous';

export function setGuestScope(userId: string | null): void {
  activeGuestUserId = userId ?? 'anonymous';
}

export function getGuestScope(): string {
  return activeGuestUserId;
}

export function guestStorageKey(name: string): string {
  return `guest:${activeGuestUserId}:${name}`;
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
