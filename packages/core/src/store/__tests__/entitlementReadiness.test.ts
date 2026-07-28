import { describe, expect, it } from 'vitest';
import {
  ENTITLEMENT_SNAPSHOT_MAX_AGE_MS,
  isEntitlementSnapshotFresh,
} from '../useEntitlementStore';

describe('entitlement snapshot readiness', () => {
  const now = Date.parse('2026-07-26T00:00:00.000Z');

  it('accepts a recent snapshot', () => {
    expect(
      isEntitlementSnapshotFresh(
        new Date(now - ENTITLEMENT_SNAPSHOT_MAX_AGE_MS + 1).toISOString(),
        now,
      ),
    ).toBe(true);
  });

  it('rejects missing and expired snapshots', () => {
    expect(isEntitlementSnapshotFresh(null, now)).toBe(false);
    expect(
      isEntitlementSnapshotFresh(
        new Date(now - ENTITLEMENT_SNAPSHOT_MAX_AGE_MS - 1).toISOString(),
        now,
      ),
    ).toBe(false);
  });
});
