import { describe, it, expect, beforeEach } from 'vitest';
import {
  useEntitlementStore,
  isEntitlementSnapshotFresh,
  ENTITLEMENT_SNAPSHOT_MAX_AGE_MS,
} from '../useEntitlementStore';

describe('useEntitlementStore', () => {
  beforeEach(() => {
    useEntitlementStore.getState().clearEntitlements();
  });

  it('correctly calculates snapshot freshness under 24 hours', () => {
    const now = Date.now();
    const freshIso = new Date(now - 1000 * 60 * 60).toISOString(); // 1 hour ago
    const staleIso = new Date(now - ENTITLEMENT_SNAPSHOT_MAX_AGE_MS - 1000).toISOString(); // > 24 hours

    expect(isEntitlementSnapshotFresh(freshIso, now)).toBe(true);
    expect(isEntitlementSnapshotFresh(staleIso, now)).toBe(false);
    expect(isEntitlementSnapshotFresh(null, now)).toBe(false);
    expect(isEntitlementSnapshotFresh('invalid-date', now)).toBe(false);
  });

  it('starts in initial cleared state', () => {
    const state = useEntitlementStore.getState();
    expect(state.activeEntitlements).toEqual([]);
    expect(state.grants).toEqual([]);
    expect(state.pricingTier).toBe('FREE');
    expect(state.readiness).toBe('unknown');
    expect(state.manifestLoaded).toBe(false);
  });

  it('allows manual synchronous state hydration for offline tests', () => {
    useEntitlementStore.setState({
      activeEntitlements: ['ai_assistant', 'advanced_analytics'],
      grants: [],
      pricingTier: 'PRO',
      manifestLoaded: true,
      readiness: 'verified',
      snapshotRefreshedAt: new Date().toISOString(),
      snapshotUserId: 'user-uuid-1',
      snapshotActiveBondId: null,
      isLoading: false,
      error: null,
    });

    const state = useEntitlementStore.getState();
    expect(state.activeEntitlements).toContain('ai_assistant');
    expect(state.pricingTier).toBe('PRO');
    expect(state.readiness).toBe('verified');
  });
});
