import {
  type BootstrapRoutePolicy,
  type BootstrapSessionState,
  getBootstrapSessionState,
} from '@/logic/auth/bootstrapContract';
import type { IdentityMode } from '@/logic/auth/identityState';

export type RouteDecision = 'booting' | 'public' | 'onboarding' | 'app';

export type RouteTarget = {
  decision: RouteDecision;
  redirectTo: string | null;
  policy: BootstrapRoutePolicy;
};

export function getAuthRouteDecision(params: {
  pathname: string;
  bootstrapReady: boolean;
  sessionMode: IdentityMode | null;
  onboardingCompleted: boolean;
  hasActiveCapacity?: boolean;
  hasSession?: boolean;
}): RouteDecision {
  return getAuthRouteTarget(params).decision;
}

export function getAuthRouteTarget(params: {
  pathname: string;
  bootstrapReady: boolean;
  sessionMode: IdentityMode | null;
  onboardingCompleted: boolean;
  hasSession?: boolean;
}): RouteTarget {
  const { pathname } = params;
  const state = getBootstrapSessionState(params);
  const isPublicPath =
    pathname === '/welcome' || pathname === '/auth' || pathname.startsWith('/public-form');
  const isAppEntryPath = pathname === '/' || pathname === '/welcome' || pathname === '/auth';
  const isOnboardingPath = pathname === '/onboarding';

  if (state === 'booting') {
    return {
      decision: 'booting',
      redirectTo: null,
      policy: {
        state,
        entryPoint: 'welcome',
        reason: 'loading',
        redirectTo: null,
        canRenderCurrentPath: true,
      },
    };
  }

  if (state === 'public') {
    return {
      decision: 'public',
      redirectTo: isPublicPath ? null : '/welcome',
      policy: {
        state,
        entryPoint: pathname.startsWith('/public-form')
          ? 'public-form'
          : pathname === '/auth'
            ? 'auth'
            : 'welcome',
        reason: isPublicPath ? 'already-public' : 'no-session',
        redirectTo: isPublicPath ? null : '/welcome',
        canRenderCurrentPath: isPublicPath,
      },
    };
  }

  if (state === 'onboarding-needed') {
    return {
      decision: 'onboarding',
      redirectTo: isOnboardingPath ? null : '/onboarding',
      policy: {
        state,
        entryPoint: isOnboardingPath ? 'onboarding' : 'welcome',
        reason: 'needs-onboarding',
        redirectTo: isOnboardingPath ? null : '/onboarding',
        canRenderCurrentPath: isOnboardingPath,
      },
    };
  }

  return {
    decision: 'app',
    redirectTo: isAppEntryPath || isOnboardingPath ? '/self' : null,
    policy: {
      state: 'ready' satisfies BootstrapSessionState,
      entryPoint: isOnboardingPath ? 'onboarding' : isPublicPath ? 'auth' : 'app',
      reason: 'ready-for-app',
      redirectTo: isAppEntryPath || isOnboardingPath ? '/self' : null,
      canRenderCurrentPath: !isAppEntryPath && !isOnboardingPath,
    },
  };
}

export function isPublicBootstrapRoute(pathname: string): boolean {
  return pathname === '/welcome' || pathname === '/auth' || pathname.startsWith('/public-form');
}
