import { act, create } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  pathname: '/self',
  replace: vi.fn(),
  routeTarget: { decision: 'booting', redirectTo: null },
  routeState: {},
}));

vi.mock('expo-router', () => ({
  usePathname: () => mocks.pathname,
  useRouter: () => ({ replace: mocks.replace }),
}));
vi.mock('@repo/core/logic', () => ({
  isPublicBootstrapRoute: (pathname: string) =>
    pathname === '/welcome' || pathname === '/auth' || pathname === '/auth/callback',
}));
vi.mock('@/entry/bootstrapRouteState', () => ({
  getBootstrapRouteTarget: () => mocks.routeTarget,
  useBootstrapRouteState: () => mocks.routeState,
}));

import { SessionRouteGate } from '@/entry/SessionRouteGate';

describe('SessionRouteGate account isolation', () => {
  beforeEach(() => {
    mocks.pathname = '/self';
    mocks.replace.mockReset();
    mocks.routeTarget = { decision: 'booting', redirectTo: null };
  });

  it('withholds protected shell content while a different account profile is resolving', async () => {
    let tree: ReturnType<typeof create>;
    await act(async () => {
      tree = create(
        <SessionRouteGate>
          <>{'account-a-shell'}</>
        </SessionRouteGate>,
      );
    });

    expect(tree!.toJSON()).toBeNull();
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

  it('keeps the index redirect mounted during bootstrap', async () => {
    mocks.pathname = '/';
    let tree: ReturnType<typeof create>;
    await act(async () => {
      tree = create(
        <SessionRouteGate>
          <>{'index-redirect'}</>
        </SessionRouteGate>,
      );
    });

    expect(tree!.toJSON()).toBe('index-redirect');
  });
});
