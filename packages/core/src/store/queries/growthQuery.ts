/**
 * Growth as server state (Tier 4): the query key, the read and its offline snapshot. The hook that
 * screens use is hooks/useGrowthQuery.ts. Decoding happens in the adapter behind `growthView`.
 */
import { growthView } from '@repo/core/effect/bindings';
import { sessionScope } from '@repo/core/effect/bindings/state';
import type { GrowthView, SavedGrowth } from '@repo/core/logic/schemas/growth.schema';

export const growthQueryKey = (principalId: string | null) => ['growth-state', principalId] as const;

export const growthSnapshotKey = (principalId: string | null): string =>
  growthView.snapshotKey(String(principalId));

export const decodeGrowthSnapshot = (raw: string, principalId: string | null): SavedGrowth =>
  growthView.decodeSnapshot(raw, principalId);

/**
 * Reads the account's growth view and keeps an offline copy. Refuses to publish a result if the
 * request was cancelled or the account changed while it was in flight (A → B → A included).
 */
export async function readGrowth(
  principalId: string | null,
  signal: AbortSignal,
): Promise<GrowthView | null> {
  const revision = sessionScope.accountRevision();
  if (!principalId || sessionScope.activeAccountId() !== principalId)
    throw new Error('Growth account is not ready.');
  const stale = () =>
    signal.aborted ||
    revision !== sessionScope.accountRevision() ||
    sessionScope.activeAccountId() !== principalId;
  const data = await growthView.read(principalId);
  if (stale()) throw new Error('Growth account ended before its response arrived.');
  try {
    await growthView.writeSnapshot(growthSnapshotKey(principalId), data);
  } catch (error) {
    console.warn('[Growth] Offline snapshot could not be retained.', error);
  }
  if (stale()) throw new Error('Growth account ended before its snapshot completed.');
  return data;
}
