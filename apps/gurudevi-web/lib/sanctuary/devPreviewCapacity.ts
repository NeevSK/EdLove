import type { ExploreCapacity } from '../explore/exploreCapacity';

/** Preview capacity is local presentation state, not an account bond. */
export function setDevPreviewCapacity(capacity: ExploreCapacity): void {
  document.cookie = `gurudevi_dev_role=${encodeURIComponent(capacity)}; Path=/; SameSite=Lax`;
  const next = new URL(window.location.href);
  next.searchParams.set('role', capacity);
  window.location.assign(next.toString());
}
