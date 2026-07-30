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
