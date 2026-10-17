import { act, create } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  pathname: '/self',
  replace: vi.fn(),
  routeState: {} as { profileError?: string | null },
  routeTarget: { decision: 'booting', redirectTo: null as string | null },
}));

vi.mock('expo-router', () => ({
  useGlobalSearchParams: () => ({}),
  usePathname: () => mocks.pathname,
  useRouter: () => ({ replace: mocks.replace }),
}));
vi.mock('@repo/core/logic', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@repo/core/logic')>();
  return { ...actual, useAuth: () => ({ refreshProfile: vi.fn() }) };
});
vi.mock('@/entry/bootstrapRouteState', () => ({
  getBootstrapRouteTarget: () => mocks.routeTarget,
  useBootstrapRouteState: () => mocks.routeState,
}));
vi.mock('@repo/ui/components/BrandPulse', () => ({ BrandPulse: () => null }));
vi.mock('@repo/ui/components/Mascot', () => ({ Mascot: () => null }));
vi.mock('@repo/ui/primitives', () => ({
  Box: 'Box',
  Pressable: 'Pressable',
  Text: 'Text',
}));

import { pendingIntentStore } from '@repo/core/logic/deeplink/pendingIntentStore';
import { SessionRouteGate } from '@/entry/SessionRouteGate';

import { redirectSystemPath } from '../../../app/+native-intent';

function AppShell() {
  return <>app-shell</>;
}

describe('entry admission scenarios', () => {
  beforeEach(() => {
    pendingIntentStore.getState().clearPendingIntent();
    mocks.pathname = '/self';
    mocks.replace.mockReset();
    mocks.routeState = {};
    mocks.routeTarget = { decision: 'booting', redirectTo: null };
  });

  it('holds a signed-out invite through public admission and resumes it once after auth admission', async () => {
    const targetPath = await redirectSystemPath({
      path: 'gurudevi://invite/classroom/TEACHER2026',
      initial: true,
    });
    mocks.pathname = '/community';
    mocks.routeTarget = { decision: 'public', redirectTo: '/welcome' };

    let tree: ReturnType<typeof create>;
    await act(async () => {
      tree = create(
        <SessionRouteGate>
          <AppShell />
        </SessionRouteGate>,
      );
    });

    expect(mocks.replace).toHaveBeenCalledWith('/welcome');
    expect(pendingIntentStore.getState().getPendingIntent()?.targetPath).toBe(targetPath);

    mocks.pathname = '/auth/callback';
    mocks.routeTarget = { decision: 'app', redirectTo: '/self' };
    await act(async () => {
      tree!.update(
        <SessionRouteGate>
          <AppShell />
        </SessionRouteGate>,
      );
    });

    expect(mocks.replace).toHaveBeenLastCalledWith(targetPath);
    expect(pendingIntentStore.getState().getPendingIntent()).toBeNull();
  });

  it('does not drain a QR action while a mismatched account is restoring', async () => {
    const targetPath = await redirectSystemPath({
      path: 'gurudevi://qr?v=1&action=join_class&classroom_id=c123',
      initial: true,
    });
    mocks.pathname = '/self';
    mocks.routeTarget = { decision: 'booting', redirectTo: null };

    let tree: ReturnType<typeof create>;
    await act(async () => {
      tree = create(
        <SessionRouteGate>
          <AppShell />
        </SessionRouteGate>,
      );
    });

    expect(mocks.replace).not.toHaveBeenCalled();
    expect(pendingIntentStore.getState().getPendingIntent()?.targetPath).toBe(targetPath);

    mocks.routeTarget = { decision: 'app', redirectTo: null };
    await act(async () => {
      tree!.update(
        <SessionRouteGate>
          <AppShell />
        </SessionRouteGate>,
      );
    });

    expect(mocks.replace).toHaveBeenCalledWith(targetPath);
    expect(pendingIntentStore.getState().getPendingIntent()).toBeNull();
  });
});
