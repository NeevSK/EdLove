import { describe, expect, it } from 'vitest';
import {
  getSessionRouteReadiness,
  hasUsableOfflineCapabilitySnapshot,
} from '@/boot/sessionRouteReadiness';

describe('session route readiness', () => {
  it('accepts only a fresh local snapshot owned by the restored session', () => {
    expect(
      hasUsableOfflineCapabilitySnapshot({
        sessionUserId: 'session-user',
        snapshotUserId: 'session-user',
        manifestLoaded: true,
        readiness: 'cached',
      }),
    ).toBe(true);
    expect(
      hasUsableOfflineCapabilitySnapshot({
        sessionUserId: 'session-user',
        snapshotUserId: 'another-user',
        manifestLoaded: true,
        readiness: 'cached',
      }),
    ).toBe(false);
    expect(
      hasUsableOfflineCapabilitySnapshot({
        sessionUserId: 'session-user',
        snapshotUserId: 'session-user',
        manifestLoaded: true,
        readiness: 'stale',
      }),
    ).toBe(false);
  });

  it('does not make the public welcome path wait for a profile fetch', () => {
    expect(
      getSessionRouteReadiness({
        isSessionLoading: false,
        isProfileResolving: false,
        hasProfileError: false,
        hasSession: false,
        hasCachedCapabilities: false,
        hasLiveCapacity: false,
      }),
    ).toMatchObject({ routeGuardReady: true, hasActiveCapacity: false });
  });

  it('keeps an authenticated user on the safe shell while first capabilities resolve', () => {
    expect(
      getSessionRouteReadiness({
        isSessionLoading: false,
        isProfileResolving: true,
        hasProfileError: false,
        hasSession: true,
        hasCachedCapabilities: false,
        hasLiveCapacity: false,
      }).routeGuardReady,
    ).toBe(false);
  });

  it('uses cached capabilities for an offline-capable authenticated return', () => {
    expect(
      getSessionRouteReadiness({
        isSessionLoading: false,
        isProfileResolving: true,
        hasProfileError: false,
        hasSession: true,
        hasCachedCapabilities: true,
        hasLiveCapacity: false,
      }),
    ).toMatchObject({ routeGuardReady: true, hasActiveCapacity: true });
  });

  it('never treats an unresolved local session as authenticated', () => {
    expect(
      getSessionRouteReadiness({
        isSessionLoading: true,
        isProfileResolving: false,
        hasProfileError: false,
        hasSession: true,
        hasCachedCapabilities: true,
        hasLiveCapacity: true,
      }).routeGuardReady,
    ).toBe(false);
  });

  it('holds the public shell and exposes a retryable blocked state after a profile failure', () => {
    expect(
      getSessionRouteReadiness({
        isSessionLoading: false,
        isProfileResolving: false,
        hasProfileError: true,
        hasSession: true,
        hasCachedCapabilities: false,
        hasLiveCapacity: false,
      }),
    ).toMatchObject({ routeGuardReady: false, isCapabilityResolutionBlocked: true });
  });
});
