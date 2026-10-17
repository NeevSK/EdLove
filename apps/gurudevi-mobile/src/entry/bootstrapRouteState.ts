import {
  getAuthRouteTarget,
  getSessionIdentityMode,
  type IdentityAvailability,
  isResolvedAuthSubjectCurrent,
  useAuth,
  useStore,
} from '@repo/core/logic';
import type { AuthSession } from '@repo/core/logic/ports/auth.port';
import { getLocalGuestIdentity } from '@repo/core/native/guestIdentity';
import { getOrCreateGuestLease } from '@repo/core/native/guestLease';
import { setGuestScope } from '@repo/core/native/guestScope';
import { useEntitlementStore } from '@repo/core/store/useEntitlementStore';
import { useEffect, useState } from 'react';

import {
  getSessionRouteReadiness,
  hasUsableOfflineCapabilitySnapshot,
} from '@/boot/sessionRouteReadiness';
import { getFirstValueRoute } from '@/entry/firstValueRoute';

export type BootstrapRouteState = {
  hasActiveAccessToken: boolean;
  identityAvailability: IdentityAvailability;
  isProfileResolving: boolean;
  isSessionLoading: boolean;
  onboardingCompleted: boolean;
  pathname: string;
  profileError: string | null;
  session: AuthSession | null;
  hasLiveCapacity: boolean;
  hasProfileName: boolean;
  activeCapacity?: string | null;
  isProfileForSession: boolean;
  entitlement: Pick<
    ReturnType<typeof useEntitlementStore.getState>,
    'manifestLoaded' | 'readiness' | 'snapshotUserId'
  >;
  isGuestRouteStateLoading?: boolean;
  isLocalGuestReady?: boolean;
};

type LocalGuestRouteState = {
  isLoading: boolean;
  isReady: boolean;
};

function useLocalGuestRouteState(
  session: AuthSession | null,
  onboardingCompleted: boolean,
): LocalGuestRouteState {
  const isAnonymous = getSessionIdentityMode(session) === 'anonymous';
  const [state, setState] = useState<LocalGuestRouteState>({
    isLoading: isAnonymous,
    isReady: false,
  });

  useEffect(() => {
    if (!isAnonymous || !session?.user.id) {
      setGuestScope(null);
      setState({ isLoading: false, isReady: false });
      return;
    }

    let active = true;
    setState({ isLoading: true, isReady: false });
    void getLocalGuestIdentity(session.user.id)
      .then(async (identity) => {
        if (!identity.onboarding_completed || !identity.activeBond?.capacity) {
          return { isReady: false };
        }
        setGuestScope(session.user.id);
        const lease = await getOrCreateGuestLease(session.user.id);
        return { isReady: !lease.isExpired };
      })
      .then((next) => {
        if (active) setState({ isLoading: false, isReady: next.isReady });
      })
      .catch((error: unknown) => {
        console.warn('[entry] unable to restore local guest admission state:', error);
        if (active) setState({ isLoading: false, isReady: false });
      });

    return () => {
      active = false;
    };
  }, [isAnonymous, onboardingCompleted, session?.user.id]);

  return state;
}

/**
 * Collects live and persisted bootstrap inputs into the one snapshot consumed
 * by the route policy. Screens should not reinterpret these sources directly.
 */
export function useBootstrapRouteState(pathname: string): BootstrapRouteState {
  const {
    identityAvailability,
    isProfileResolving,
    loading,
    profileError,
    resolvedAuthSubjectId,
    session,
  } = useAuth();
  const profile = useStore((state) => state.user);
  const activeBond = useStore((state) => state.activeBond);
  const onboardingCompleted = useStore((state) => state.onboardingCompleted);
  const profileBelongsToSession = Boolean(
    profile?.id && isResolvedAuthSubjectCurrent(resolvedAuthSubjectId, session?.user.id),
  );
  const hasLiveCapacity = Boolean(profileBelongsToSession && activeBond?.capacity);
  const activeCapacity = profileBelongsToSession ? (activeBond?.capacity ?? null) : null;
  const hasProfileName = Boolean(profileBelongsToSession && profile?.display_name?.trim());
  const { manifestLoaded, readiness, snapshotUserId } = useEntitlementStore();
  const localGuest = useLocalGuestRouteState(session, onboardingCompleted);
  const isAnonymous = getSessionIdentityMode(session) === 'anonymous';
  const hasActiveAccessToken = Boolean(
    session?.access_token &&
      typeof session.expires_at === 'number' &&
      session.expires_at > Math.floor(Date.now() / 1000),
  );

  return {
    hasActiveAccessToken,
    identityAvailability,
    isProfileResolving,
    isSessionLoading: loading,
    onboardingCompleted: isAnonymous ? localGuest.isReady : onboardingCompleted,
    pathname,
    profileError,
    session,
    hasLiveCapacity,
    activeCapacity,
    hasProfileName,
    isProfileForSession: profileBelongsToSession,
    entitlement: { manifestLoaded, readiness, snapshotUserId },
    isGuestRouteStateLoading: isAnonymous && localGuest.isLoading,
    isLocalGuestReady: isAnonymous && localGuest.isReady,
  };
}

export function getBootstrapRouteTarget(
  state: BootstrapRouteState,
  options: { guestOnboardingIntent?: boolean } = {},
) {
  if (state.isGuestRouteStateLoading) {
    return getAuthRouteTarget({
      bootstrapReady: false,
      hasActiveCapacity: false,
      hasActiveAccessToken: state.hasActiveAccessToken,
      hasSession: Boolean(state.session),
      identityAvailability: state.identityAvailability,
      hasProfileForSession: state.isProfileForSession,
      hasProfileName: state.hasProfileName,
      onboardingCompleted: false,
      pathname: state.pathname,
      sessionMode: getSessionIdentityMode(state.session),
      guestOnboardingIntent: options.guestOnboardingIntent,
      appEntryPath: getFirstValueRoute(state.activeCapacity),
    });
  }
  const hasCachedCapabilities = hasUsableOfflineCapabilitySnapshot({
    sessionUserId: state.session?.user.id,
    snapshotUserId: state.entitlement.snapshotUserId,
    manifestLoaded: state.entitlement.manifestLoaded,
    readiness: state.entitlement.readiness,
  });
  const readiness = getSessionRouteReadiness({
    isSessionLoading: state.isSessionLoading,
    isProfileResolving: state.isProfileResolving,
    hasProfileError: Boolean(state.profileError),
    hasSession: Boolean(state.session),
    guestOnboardingIntent: options.guestOnboardingIntent,
    hasCachedCapabilities: hasCachedCapabilities || Boolean(state.isLocalGuestReady),
    hasLiveCapacity: state.hasLiveCapacity || Boolean(state.isLocalGuestReady),
  });

  return getAuthRouteTarget({
    bootstrapReady: readiness.routeGuardReady,
    hasActiveCapacity: readiness.hasActiveCapacity,
    hasActiveAccessToken: state.hasActiveAccessToken,
    hasSession: Boolean(state.session),
    identityAvailability: state.identityAvailability,
    hasProfileForSession: state.isProfileForSession,
    hasProfileName: state.hasProfileName || Boolean(state.isLocalGuestReady),
    onboardingCompleted: state.onboardingCompleted,
    pathname: state.pathname,
    sessionMode: getSessionIdentityMode(state.session),
    guestOnboardingIntent: options.guestOnboardingIntent,
    appEntryPath: getFirstValueRoute(state.activeCapacity),
  });
}
