import type { IdentityMode } from './identityState';

export type BootstrapSessionState =
  | 'booting'
  | 'guest'
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
  hasSession?: boolean;
}): BootstrapSessionState {
  const { bootstrapReady, sessionMode, onboardingCompleted, hasSession } = params;

  if (!bootstrapReady) return 'booting';
  if (!hasSession || sessionMode === 'guest') return 'guest';
  if (!onboardingCompleted) return 'onboarding-needed';
  return 'ready';
}
