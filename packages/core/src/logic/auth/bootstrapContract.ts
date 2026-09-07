import type { IdentityAvailability, IdentityMode } from '@repo/core/logic/auth/identityState';

export type BootstrapSessionState =
  | 'booting'
  | 'public'
  | 'inactive-account'
  | 'authenticated'
  | 'onboarding-needed'
  | 'ready';

export type BootstrapEntryPoint =
  | 'welcome'
  | 'auth'
  | 'onboarding'
  | 'app'
  | 'public-form'
  | 'account-recovery';

export type BootstrapRouteReason =
  | 'loading'
  | 'no-session'
  | 'already-public'
  | 'account-inactive'
  | 'needs-onboarding'
  | 'ready-for-app';

export type BootstrapRoutePolicy = {
  state: BootstrapSessionState;
  entryPoint: BootstrapEntryPoint;
  reason: BootstrapRouteReason;
  redirectTo: string | null;
  canRenderCurrentPath: boolean;
};

export function getBootstrapSessionState(params: {
  bootstrapReady: boolean;
  sessionMode: IdentityMode | null;
  identityAvailability?: IdentityAvailability;
  hasProfileForSession?: boolean;
  hasProfileName?: boolean;
  onboardingCompleted: boolean;
  hasActiveCapacity?: boolean;
  hasSession?: boolean;
}): BootstrapSessionState {
  const {
    bootstrapReady,
    sessionMode,
    identityAvailability = 'unknown',
    hasProfileForSession = true,
    hasProfileName = true,
    onboardingCompleted,
    hasActiveCapacity = true,
    hasSession,
  } = params;

  if (!bootstrapReady) return 'booting';
  if (!hasSession || sessionMode === 'unauthenticated') return 'public';
  if (sessionMode === 'anonymous' && (!onboardingCompleted || !hasActiveCapacity)) {
    return 'public';
  }

  if (sessionMode === 'authenticated' && identityAvailability === 'inactive') {
    return 'inactive-account';
  }

  if (sessionMode === 'authenticated' && !hasProfileForSession) {
    return 'booting';
  }

  if (!onboardingCompleted || !hasActiveCapacity || !hasProfileName) {
    return 'onboarding-needed';
  }
  return 'ready';
}
