import type { IdentityMode } from '@/logic/auth/identityState';

export type BootstrapSessionState =
  | 'booting'
  | 'public'
  | 'authenticated'
  | 'onboarding-needed'
  | 'ready';

export type BootstrapEntryPoint = 'welcome' | 'auth' | 'onboarding' | 'app' | 'public-form';

export type BootstrapRouteReason =
  | 'loading'
  | 'no-session'
  | 'already-public'
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
  onboardingCompleted: boolean;
  hasActiveCapacity?: boolean;
  hasSession?: boolean;
}): BootstrapSessionState {
  const {
    bootstrapReady,
    sessionMode,
    onboardingCompleted,
    hasActiveCapacity = true,
    hasSession,
  } = params;

  if (!bootstrapReady) return 'booting';
  if (!hasSession || sessionMode === 'unauthenticated') return 'public';
  if (!onboardingCompleted || !hasActiveCapacity) return 'onboarding-needed';
  return 'ready';
}
