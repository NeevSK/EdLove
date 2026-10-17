import {
  type BootstrapRoutePolicy,
  type BootstrapSessionState,
  getBootstrapSessionState,
} from '@repo/core/logic/auth/bootstrapContract';
import type { IdentityAvailability, IdentityMode } from '@repo/core/logic/auth/identityState';

export type RouteDecision = 'booting' | 'public' | 'inactive-account' | 'onboarding' | 'app';

export type RouteTarget = {
  decision: RouteDecision;
  redirectTo: string | null;
  policy: BootstrapRoutePolicy;
};

export type AuthRouteInput = {
  pathname: string;
  bootstrapReady: boolean;
  sessionMode: IdentityMode | null;
  identityAvailability?: IdentityAvailability;
  hasProfileForSession?: boolean;
  hasProfileName?: boolean;
  onboardingCompleted: boolean;
  hasActiveCapacity?: boolean;
  hasActiveAccessToken?: boolean;
  hasSession?: boolean;
  guestOnboardingIntent?: boolean;
  appEntryPath?: AppEntryPath;
};

export type AppEntryPath = '/self' | '/workspace';

export function getAuthRouteDecision(params: AuthRouteInput): RouteDecision {
  return getAuthRouteTarget(params).decision;
}

export function getAuthRouteTarget(params: AuthRouteInput): RouteTarget {
  const { pathname } = params;
  const state = getBootstrapSessionState(params);
  const isPublicPath =
    pathname === '/welcome' ||
    pathname === '/auth' ||
    pathname === '/auth/callback' ||
    pathname === '/onboarding' ||
    pathname.startsWith('/public-form');
  const isAppEntryPath =
    pathname === '/' || pathname === '/auth' || pathname === '/auth/callback';
  const isOnboardingPath = pathname === '/onboarding';
  const isAccountRecoveryPath = pathname === '/account-recovery';
  const appEntryPath = params.appEntryPath ?? '/self';

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

  if (params.guestOnboardingIntent && isOnboardingPath) {
    if (params.sessionMode !== 'anonymous') {
      return {
        decision: 'public',
        redirectTo: '/welcome',
        policy: {
          state: 'public',
          entryPoint: 'welcome',
          reason: 'no-session',
          redirectTo: '/welcome',
          canRenderCurrentPath: false,
        },
      };
    }

    if (state === 'ready') {
      return {
        decision: 'app',
        redirectTo: appEntryPath,
        policy: {
          state: 'ready',
          entryPoint: 'app',
          reason: 'ready-for-app',
          redirectTo: appEntryPath,
          canRenderCurrentPath: false,
        },
      };
    }

    return {
      decision: 'public',
      redirectTo: null,
      policy: {
        state: 'public',
        entryPoint: 'onboarding',
        reason: 'already-public',
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

  if (state === 'inactive-account') {
    return {
      decision: 'inactive-account',
      redirectTo: isAccountRecoveryPath ? null : '/account-recovery',
      policy: {
        state,
        entryPoint: 'account-recovery',
        reason: 'account-inactive',
        redirectTo: isAccountRecoveryPath ? null : '/account-recovery',
        canRenderCurrentPath: isAccountRecoveryPath,
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

  if (params.sessionMode === 'anonymous') {
    if (pathname === '/auth' || pathname === '/auth/callback') {
      return {
        decision: 'public',
        redirectTo: null,
        policy: {
          state: 'public',
          entryPoint: pathname === '/auth' ? 'auth' : 'welcome',
          reason: 'already-public',
          redirectTo: null,
          canRenderCurrentPath: true,
        },
      };
    }
  }

  return {
    decision: 'app',
    // Welcome is an explicit public landing surface. Restoring a remembered
    // session must never move someone into the app before they choose a
    // sign-in or onboarding action.
    redirectTo: isAppEntryPath || isOnboardingPath ? appEntryPath : null,
    policy: {
      state: 'ready' satisfies BootstrapSessionState,
      entryPoint: isOnboardingPath ? 'onboarding' : isPublicPath ? 'auth' : 'app',
      reason: 'ready-for-app',
      redirectTo: isAppEntryPath || isOnboardingPath ? appEntryPath : null,
      canRenderCurrentPath: !isAppEntryPath && !isOnboardingPath,
    },
  };
}

export function isPublicBootstrapRoute(pathname: string): boolean {
  return (
    pathname === '/welcome' ||
    pathname === '/auth' ||
    pathname === '/auth/callback' ||
    pathname === '/onboarding' ||
    pathname.startsWith('/public-form')
  );
}
