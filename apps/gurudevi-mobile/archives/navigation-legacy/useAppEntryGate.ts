import type { NavigationContainerRefWithCurrent } from '@react-navigation/native';
import { useEffect, useRef } from 'react';

type SessionLike = object | null;

const PUBLIC_ROOT_ROUTES = new Set([
  'Welcome',
  'Auth',
  'Onboarding',
  'InvitationWelcome',
  'PublicForm',
  'QRHandler',
  'Main',
]);

const SETUP_FLOW_ROUTES = new Set(['Welcome', 'Auth', 'Onboarding']);

const APP_ROOT_ROUTES = new Set([
  'AdminDashboard',
  'AdminIncidentQueue',
  'AdminTenantDetail',
  'AdminAuthorityRepair',
  'AdminJobControl',
  'AdminAuditLog',
  'AdminReleaseControl',
  'AIAssistant',
  'ThuthimalClaim',
]);

type GateIntent =
  | { type: 'idle' }
  | { type: 'navigate'; route: 'Main' | 'Onboarding' }
  | { type: 'reset'; route: 'Welcome' | 'Onboarding' };

function resolveGateIntent({
  session,
  isProfileLoading,
  onboardingCompleted,
  currentRoute,
  justCompletedOnboarding,
}: {
  session: SessionLike;
  isProfileLoading: boolean;
  onboardingCompleted: boolean;
  currentRoute?: string;
  justCompletedOnboarding: boolean;
}): GateIntent {
  if (isProfileLoading || !currentRoute) {
    return { type: 'idle' };
  }

  if (!session) {
    return currentRoute && APP_ROOT_ROUTES.has(currentRoute)
      ? { type: 'reset', route: 'Welcome' }
      : { type: 'idle' };
  }

  if (justCompletedOnboarding) {
    return { type: 'navigate', route: 'Main' };
  }

  if (!onboardingCompleted) {
    if (currentRoute === 'Welcome') {
      return { type: 'navigate', route: 'Onboarding' };
    }

    return currentRoute && APP_ROOT_ROUTES.has(currentRoute)
      ? { type: 'reset', route: 'Onboarding' }
      : { type: 'idle' };
  }

  if (SETUP_FLOW_ROUTES.has(currentRoute)) {
    return { type: 'navigate', route: 'Main' };
  }

  if (!PUBLIC_ROOT_ROUTES.has(currentRoute) && !APP_ROOT_ROUTES.has(currentRoute)) {
    return { type: 'navigate', route: 'Main' };
  }

  return { type: 'idle' };
}

export function useAppEntryGate({
  navigationRef,
  session,
  isProfileLoading,
  onboardingCompleted,
}: {
  navigationRef: NavigationContainerRefWithCurrent<Record<string, unknown>> | null;
  session: SessionLike;
  isProfileLoading: boolean;
  onboardingCompleted: boolean;
}) {
  // Archived gate kept for support paths that still surface a legacy route ref.
  const previousOnboardingCompleted = useRef(onboardingCompleted);

  useEffect(() => {
    if (!navigationRef?.isReady()) return;

    const currentRoute =
      navigationRef.getRootState()?.routes?.[navigationRef.getRootState()?.index ?? -1]?.name;
    const justCompletedOnboarding =
      previousOnboardingCompleted.current === false && onboardingCompleted === true;
    previousOnboardingCompleted.current = onboardingCompleted;

    const intent = resolveGateIntent({
      session,
      isProfileLoading,
      onboardingCompleted,
      currentRoute,
      justCompletedOnboarding,
    });

    if (intent.type === 'navigate') {
      navigationRef.navigate(intent.route as never);
      return;
    }

    if (intent.type === 'reset') {
      navigationRef.reset({
        index: 0,
        routes: [{ name: intent.route as never }],
      });
    }
  }, [navigationRef, session, isProfileLoading, onboardingCompleted]);
}
