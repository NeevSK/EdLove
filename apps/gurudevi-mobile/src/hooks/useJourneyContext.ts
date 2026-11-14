import {
  type BootstrapEntryPoint,
  type BootstrapSessionState,
  getBootstrapSessionState,
} from '@repo/core/logic/auth/bootstrapContract';
import { useAuth } from '@repo/core/providers';
import { useAuthStore } from '@repo/core/store/useAuthStore';
import { useMemo } from 'react';

export type JourneyType = 'auth' | 'onboarding' | 'create' | 'sync' | 'general';

interface JourneyContext {
  /** Current bootstrap session state. */
  bootstrapState: BootstrapSessionState;
  /** Derived journey type for UX decisions. */
  journey: JourneyType;
  /** Whether the user is in a journey-critical flow. */
  isJourneyCritical: boolean;
  /** Whether the user can safely navigate away. */
  canSafelyExit: boolean;
}

/**
 * useJourneyContext — per-screen journey awareness.
 *
 * Returns the current journey phase so individual screens can:
 * - Show journey-appropriate error messages
 * - Conditionally render retry/skip/discard actions
 * - Log journey-specific analytics events
 *
 * Does NOT provide route protection (the centralized TOBAC guard handles that).
 */
export function useJourneyContext(): JourneyContext {
  const { session } = useAuth();
  const onboardingCompleted = useAuthStore((state) => Boolean(state.user?.onboarding_completed));

  const bootstrapState = useMemo(
    () =>
      getBootstrapSessionState({
        bootstrapReady: true,
        sessionMode: session?.user ? 'authenticated' : 'unauthenticated',
        onboardingCompleted,
        hasSession: !!session,
      }),
    [session, onboardingCompleted],
  );

  const journey = useMemo<JourneyType>(() => {
    switch (bootstrapState) {
      case 'public':
        return 'auth';
      case 'onboarding-needed':
        return 'onboarding';
      case 'ready':
        return 'general';
      default:
        return 'general';
    }
  }, [bootstrapState]);

  const isJourneyCritical = journey === 'auth' || journey === 'onboarding';
  const canSafelyExit = bootstrapState === 'ready' && !isJourneyCritical;

  return useMemo(
    () => ({ bootstrapState, journey, isJourneyCritical, canSafelyExit }),
    [bootstrapState, journey, isJourneyCritical, canSafelyExit],
  );
}
