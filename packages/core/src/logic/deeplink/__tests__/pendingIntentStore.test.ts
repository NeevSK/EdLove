import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_PENDING_INTENT_TTL_MS,
  isPendingIntentExpired,
  LEGACY_DEFERRED_DEEP_LINK_KEY,
  pendingIntentStore,
  usePendingIntentStore,
} from '../pendingIntentStore';

describe('pendingIntentStore (G0 Sovereign Intent Store Tests)', () => {
  beforeEach(() => {
    usePendingIntentStore.getState().clearPendingIntent();
  });

  it('stores and retrieves an unauthenticated deep link intent', () => {
    pendingIntentStore.getState().setPendingIntent({
      targetPath: '/community?inviteCode=MATH2026',
      intentKind: 'classroomInvite',
      params: { inviteCode: 'MATH2026' },
      originalUrl: 'https://gurudevi.app/c/MATH2026',
    });

    const stored = pendingIntentStore.getState().getPendingIntent();
    expect(stored).not.toBeNull();
    expect(stored?.targetPath).toBe('/community?inviteCode=MATH2026');
    expect(stored?.intentKind).toBe('classroomInvite');
    expect(stored?.params.inviteCode).toBe('MATH2026');
    expect(stored?.originalUrl).toBe('https://gurudevi.app/c/MATH2026');
    expect(pendingIntentStore.getState().isPendingIntentActive()).toBe(true);
  });

  it('drains intent once and clears it immediately to prevent duplicate replays', () => {
    pendingIntentStore.getState().setPendingIntent({
      targetPath: '/community?inviteCode=ONCE_ONLY',
      intentKind: 'classroomInvite',
      params: { inviteCode: 'ONCE_ONLY' },
    });

    const drained = pendingIntentStore.getState().drainPendingIntent();
    expect(drained?.targetPath).toBe('/community?inviteCode=ONCE_ONLY');

    // Second call must return null
    const secondDrain = pendingIntentStore.getState().drainPendingIntent();
    expect(secondDrain).toBeNull();
    expect(pendingIntentStore.getState().getPendingIntent()).toBeNull();
    expect(pendingIntentStore.getState().isPendingIntentActive()).toBe(false);
  });

  it('enforces 15-minute TTL expiry and rejects stale intents (OWASP anti-replay)', () => {
    const now = Date.now();
    const expiredTimestamp = now - (DEFAULT_PENDING_INTENT_TTL_MS + 1000);

    pendingIntentStore.getState().setPendingIntent({
      targetPath: '/community?inviteCode=EXPIRED',
      intentKind: 'classroomInvite',
      params: { inviteCode: 'EXPIRED' },
      timestamp: expiredTimestamp,
    });

    expect(
      isPendingIntentExpired(usePendingIntentStore.getState().pendingIntent, now),
    ).toBe(true);

    // getPendingIntent automatically purges expired intents
    expect(pendingIntentStore.getState().getPendingIntent()).toBeNull();
    expect(pendingIntentStore.getState().isPendingIntentActive()).toBe(false);
  });

  it('allows explicit clearPendingIntent', () => {
    pendingIntentStore.getState().setPendingIntent({
      targetPath: '/qr?payload=test',
      intentKind: 'qr',
      params: {},
    });

    expect(pendingIntentStore.getState().isPendingIntentActive()).toBe(true);
    pendingIntentStore.getState().clearPendingIntent();
    expect(pendingIntentStore.getState().getPendingIntent()).toBeNull();
  });
});
