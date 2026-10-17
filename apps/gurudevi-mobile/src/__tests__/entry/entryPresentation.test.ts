import { describe, expect, it } from 'vitest';

import { getEntryPresentation } from '@/entry/entryPresentation';

const routeTarget = {
  decision: 'app' as const,
  redirectTo: null,
  policy: {
    state: 'ready' as const,
    entryPoint: 'app' as const,
    reason: 'ready-for-app' as const,
    redirectTo: null,
    canRenderCurrentPath: true,
  },
};

describe('entry presentation adapter', () => {
  it('keeps a protected restoring route visible instead of mounting stale content', () => {
    expect(
      getEntryPresentation({
        pathname: '/self',
        profileError: null,
        routeTarget: { ...routeTarget, decision: 'booting' },
      }),
    ).toEqual({ kind: 'restoring', message: null });
  });

  it('surfaces profile restoration failure as a recoverable restoring state', () => {
    expect(
      getEntryPresentation({
        pathname: '/workspace',
        profileError: 'Profile restore failed.',
        routeTarget: { ...routeTarget, decision: 'booting' },
      }),
    ).toEqual({ kind: 'restoring', message: 'Profile restore failed.' });
  });

  it('covers route replacement with a transition surface', () => {
    expect(
      getEntryPresentation({
        pathname: '/self',
        profileError: null,
        routeTarget: { ...routeTarget, redirectTo: '/workspace' },
      }),
    ).toEqual({ kind: 'transition', target: '/workspace' });
  });

  it('mounts protected services only for admitted protected content', () => {
    expect(
      getEntryPresentation({ pathname: '/workspace', profileError: null, routeTarget }),
    ).toEqual({ kind: 'content', mountProtectedServices: true });

    expect(
      getEntryPresentation({ pathname: '/welcome', profileError: null, routeTarget }),
    ).toEqual({ kind: 'content', mountProtectedServices: false });
  });
});
