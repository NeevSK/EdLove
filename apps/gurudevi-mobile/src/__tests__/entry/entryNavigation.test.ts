import { getAuthRouteTarget } from '@repo/core/logic/auth/bootstrapRoutes';
import type { PendingDeepLinkIntent } from '@repo/core/logic/deeplink/pendingIntentStore';
import { describe, expect, it } from 'vitest';

import { getEntryNavigationAction } from '@/entry/entryNavigation';

const appTarget = getAuthRouteTarget({
  pathname: '/self',
  bootstrapReady: true,
  sessionMode: 'authenticated',
  onboardingCompleted: true,
  hasActiveCapacity: true,
  hasSession: true,
});
const publicTarget = getAuthRouteTarget({
  pathname: '/community',
  bootstrapReady: true,
  sessionMode: 'unauthenticated',
  onboardingCompleted: false,
  hasSession: false,
});
const pendingIntent: PendingDeepLinkIntent = {
  targetPath: '/community?inviteCode=JOIN123',
  intentKind: 'classroomInvite',
  params: { inviteCode: 'JOIN123' },
  timestamp: 0,
};

describe('entry navigation action', () => {
  it('consumes and prioritizes a deferred intent only after app admission', () => {
    expect(
      getEntryNavigationAction({
        pathname: '/auth/callback',
        pendingIntent,
        routeTarget: appTarget,
      }),
    ).toEqual({ consumePendingIntent: true, target: '/community?inviteCode=JOIN123' });
  });

  it('consumes a redundant deferred intent without replacing the current base route', () => {
    expect(
      getEntryNavigationAction({ pathname: '/community', pendingIntent, routeTarget: appTarget }),
    ).toEqual({ consumePendingIntent: true, target: null });
  });

  it('holds a deferred intent outside the app and follows the authoritative redirect', () => {
    expect(
      getEntryNavigationAction({
        pathname: '/community',
        pendingIntent,
        routeTarget: publicTarget,
      }),
    ).toEqual({ consumePendingIntent: false, target: '/welcome' });
  });
});
