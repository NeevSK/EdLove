import { act, create } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  pathname: '/self',
  searchParams: {} as { entry?: string },
  replace: vi.fn(),
  refreshProfile: vi.fn(),
  routeTarget: { decision: 'booting', redirectTo: null as string | null },
  routeState: {} as { profileError?: string | null },
}));

vi.mock('expo-router', () => ({
  useGlobalSearchParams: () => mocks.searchParams,
  usePathname: () => mocks.pathname,
  useRouter: () => ({ replace: mocks.replace }),
}));
vi.mock('@repo/core/logic', () => ({
  isPublicBootstrapRoute: (pathname: string) =>
    pathname === '/welcome' ||
    pathname === '/auth' ||
    pathname === '/auth/callback' ||
    pathname === '/onboarding',
  useAuth: () => ({ refreshProfile: mocks.refreshProfile }),
}));
vi.mock('@/entry/bootstrapRouteState', () => ({
  getBootstrapRouteTarget: () => mocks.routeTarget,
  useBootstrapRouteState: () => mocks.routeState,
}));
vi.mock('@repo/ui/components/BrandPulse', () => ({
  BrandPulse: () => null,
}));
vi.mock('@repo/ui/components/Mascot', () => ({
  Mascot: () => null,
}));
vi.mock('@repo/ui/primitives', () => ({
  Box: 'Box',
  Pressable: 'Pressable',
  Text: 'Text',
}));

import {
  DEFAULT_PENDING_INTENT_TTL_MS,
  pendingIntentStore,
} from '@repo/core/logic/deeplink/pendingIntentStore';
import { SessionRouteGate } from '@/entry/SessionRouteGate';

function AppServices() {
  return null;
}

describe('SessionRouteGate account isolation', () => {
  beforeEach(() => {
    pendingIntentStore.getState().clearPendingIntent();
    mocks.pathname = '/self';
    mocks.searchParams = {};
    mocks.replace.mockReset();
    mocks.refreshProfile.mockReset();
    mocks.routeTarget = { decision: 'booting', redirectTo: null };
    mocks.routeState = {};
  });

  it('renders a visible protected bootstrap state while a different account profile resolves', async () => {
    let tree: ReturnType<typeof create>;
    await act(async () => {
      tree = create(
        <SessionRouteGate>
          <>{'account-a-shell'}</>
        </SessionRouteGate>,
      );
    });

    expect(tree!.toJSON()).not.toBeNull();
  });

  it('keeps the public callback route available during bootstrap', async () => {
    mocks.pathname = '/auth/callback';
    let tree: ReturnType<typeof create>;
    await act(async () => {
      tree = create(
        <SessionRouteGate>
          <>{'callback-shell'}</>
        </SessionRouteGate>,
      );
    });

    expect(tree!.toJSON()).toBe('callback-shell');
  });

  it('shows a bootstrap state at root until the entry resolver has authority', async () => {
    mocks.pathname = '/';
    let tree: ReturnType<typeof create>;
    await act(async () => {
      tree = create(
        <SessionRouteGate>
          <>{'root-route'}</>
        </SessionRouteGate>,
      );
    });

    expect(tree!.toJSON()).not.toBe('root-route');
  });

  it('mounts authenticated services only after the session policy enters the app', async () => {
    mocks.pathname = '/welcome';
    mocks.routeTarget = { decision: 'public', redirectTo: null };
    let tree: ReturnType<typeof create>;
    await act(async () => {
      tree = create(
        <SessionRouteGate appServices={<AppServices />}>
          <>{'public-shell'}</>
        </SessionRouteGate>,
      );
    });

    expect(tree!.root.findAllByType(AppServices)).toHaveLength(0);

    mocks.pathname = '/self';
    mocks.routeTarget = { decision: 'app', redirectTo: null };
    await act(async () => {
      tree!.update(
        <SessionRouteGate appServices={<AppServices />}>
          <>{'app-shell'}</>
        </SessionRouteGate>,
      );
    });

    expect(tree!.root.findAllByType(AppServices)).toHaveLength(1);
  });

  it('does not mount authenticated services on the welcome route', async () => {
    mocks.pathname = '/welcome';
    mocks.routeTarget = { decision: 'app', redirectTo: null };
    let tree: ReturnType<typeof create>;
    await act(async () => {
      tree = create(
        <SessionRouteGate appServices={<AppServices />}>
          <>{'welcome-shell'}</>
        </SessionRouteGate>,
      );
    });

    expect(tree!.toJSON()).toBe('welcome-shell');
    expect(tree!.root.findAllByType(AppServices)).toHaveLength(0);
  });

  it('replaces stale route content with a transition while redirecting', async () => {
    let tree: ReturnType<typeof create>;
    await act(async () => {
      tree = create(
        <SessionRouteGate>
          <>{'protected-shell'}</>
        </SessionRouteGate>,
      );
    });

    expect(tree!.toJSON()).not.toBeNull();
    expect(mocks.replace).not.toHaveBeenCalled();

    mocks.routeTarget = { decision: 'public', redirectTo: '/welcome' };
    await act(async () => {
      tree!.update(
        <SessionRouteGate>
          <>{'protected-shell'}</>
        </SessionRouteGate>,
      );
    });

    expect(tree!.toJSON()).not.toBe('protected-shell');
    expect(JSON.stringify(tree!.toJSON())).toContain('protected-shell');
    expect(mocks.replace).toHaveBeenCalledTimes(1);
    expect(mocks.replace).toHaveBeenCalledWith('/welcome');

    mocks.pathname = '/welcome';
    await act(async () => {
      tree!.update(
        <SessionRouteGate>
          <>{'protected-shell'}</>
        </SessionRouteGate>,
      );
    });

    expect(mocks.replace).toHaveBeenCalledTimes(1);
    expect(tree!.toJSON()).toBe('protected-shell');
  });

  it('shows recovery and retries profile restoration after a bootstrap failure', async () => {
    mocks.routeState = { profileError: 'profile unavailable' };
    let tree: ReturnType<typeof create>;
    await act(async () => {
      tree = create(
        <SessionRouteGate>
          <>{'protected-shell'}</>
        </SessionRouteGate>,
      );
    });

    const retry = tree!.root.findByProps({ accessibilityLabel: 'Retry restoring your sanctuary' });
    expect(retry.props.accessibilityRole).toBe('button');

    await act(async () => {
      retry.props.onPress();
    });

    expect(mocks.refreshProfile).toHaveBeenCalledTimes(1);

    const escapeHatch = tree!.root.findByProps({ accessibilityLabel: 'Return to Welcome' });
    expect(escapeHatch.props.accessibilityRole).toBe('button');

    await act(async () => {
      escapeHatch.props.onPress();
    });

    expect(mocks.replace).toHaveBeenCalledWith('/welcome');
  });

  it('drains pending intent store and navigates to deferred route when session enters app', async () => {
    pendingIntentStore.getState().setPendingIntent({
      targetPath: '/community?inviteCode=RESUME123',
      intentKind: 'classroomInvite',
      params: { inviteCode: 'RESUME123' },
    });

    mocks.pathname = '/self';
    mocks.routeTarget = { decision: 'app', redirectTo: null };

    let tree: ReturnType<typeof create>;
    await act(async () => {
      tree = create(
        <SessionRouteGate>
          <>{'app-shell'}</>
        </SessionRouteGate>,
      );
    });

    expect(mocks.replace).toHaveBeenCalledWith('/community?inviteCode=RESUME123');
    expect(pendingIntentStore.getState().getPendingIntent()).toBeNull();
  });

  it('replays a validated QR payload exactly once after session admission', async () => {
    const payload = JSON.stringify({ v: 1, action: 'join_class', classroom_id: 'c123' });
    const targetPath = `/qr?payload=${encodeURIComponent(payload)}`;
    pendingIntentStore.getState().setPendingIntent({
      targetPath,
      intentKind: 'qr',
      params: { payload },
    });

    mocks.pathname = '/self';
    mocks.routeTarget = { decision: 'app', redirectTo: null };

    await act(async () => {
      create(
        <SessionRouteGate>
          <>{'app-shell'}</>
        </SessionRouteGate>,
      );
    });

    expect(mocks.replace).toHaveBeenCalledWith(targetPath);
    expect(pendingIntentStore.getState().getPendingIntent()).toBeNull();
  });

  it('does NOT trigger redundant replace when pathname matches target base route', async () => {
    pendingIntentStore.getState().setPendingIntent({
      targetPath: '/community?inviteCode=ALREADY_HERE',
      intentKind: 'classroomInvite',
      params: { inviteCode: 'ALREADY_HERE' },
    });

    mocks.pathname = '/community';
    mocks.routeTarget = { decision: 'app', redirectTo: null };

    let tree: ReturnType<typeof create>;
    await act(async () => {
      tree = create(
        <SessionRouteGate>
          <>{'app-shell'}</>
        </SessionRouteGate>,
      );
    });

    expect(mocks.replace).not.toHaveBeenCalled();
    expect(pendingIntentStore.getState().getPendingIntent()).toBeNull();
  });

  it('discards an expired deferred intent instead of replaying it into the app', async () => {
    pendingIntentStore.getState().setPendingIntent({
      targetPath: '/community?inviteCode=EXPIRED',
      intentKind: 'classroomInvite',
      params: { inviteCode: 'EXPIRED' },
      timestamp: Date.now() - DEFAULT_PENDING_INTENT_TTL_MS - 1,
    });

    mocks.pathname = '/self';
    mocks.routeTarget = { decision: 'app', redirectTo: null };

    await act(async () => {
      create(
        <SessionRouteGate>
          <>{'app-shell'}</>
        </SessionRouteGate>,
      );
    });

    expect(mocks.replace).not.toHaveBeenCalled();
    expect(pendingIntentStore.getState().getPendingIntent()).toBeNull();
  });
});
