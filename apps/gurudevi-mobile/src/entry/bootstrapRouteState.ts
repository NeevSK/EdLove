import { useEntitlementQuery } from '@repo/core/hooks/useEntitlementQuery';
import {
  getAuthRouteTarget,
  getSessionIdentityMode,
  type IdentityAvailability,
  isResolvedAuthSubjectCurrent,
  useAuth,
} from '@repo/core/logic';
import type { AuthSession } from '@repo/core/logic/ports/auth.port';
import { getOrCreateGuestLease } from '@repo/core/native/guestLease';
import { setGuestScope } from '@repo/core/native/guestScope';
import { activateLocalGuestSession } from '@repo/core/native/localGuestActivation';
import {
  isLocalGuestSessionId,
  restoreLocalGuestSession,
} from '@repo/core/native/localGuestSession';
import { useScopeSessionStore } from '@repo/core/store/scopeSession';
import { useAuthStore } from '@repo/core/store/useAuthStore';
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
  principalId: string | null;
  activeCapacity?: string | null;
  isProfileForSession: boolean;
  entitlement: Pick<
    ReturnType<typeof useEntitlementQuery>,
    'manifestLoaded' | 'readiness' | 'snapshotUserId'
  >;
  isGuestRouteStateLoading?: boolean;
  hasLocalGuestSession?: boolean;
  isLocalGuestReady?: boolean;
};

type LocalGuestRouteState = {
  isLoading: boolean;
  isReady: boolean;
  localGuestId: string | null;
};

function useLocalGuestRouteState(
  session: AuthSession | null,
  onboardingCompleted: boolean,
  isSessionLoading: boolean,
): LocalGuestRouteState {
  const isAnonymous = getSessionIdentityMode(session) === 'anonymous';
  const [state, setState] = useState<LocalGuestRouteState>({
    isLoading: isAnonymous || session === null,
    isReady: false,
    localGuestId: null,
  });

  useEffect(() => {
    const anonymousGuestId = isAnonymous ? session?.user.id : null;
    if (session?.user && !anonymousGuestId) {
      setState({ isLoading: false, isReady: false, localGuestId: null });
      return;
    }

    let active = true;
    setState({ isLoading: true, isReady: false, localGuestId: null });
    void (
      anonymousGuestId
        ? Promise.resolve({ version: 1 as const, id: anonymousGuestId })
        : restoreLocalGuestSession()
    )
      .then((guestSession) => activateLocalGuestSession(guestSession))
      .then(async (identity) => {
        if (!identity) return null;
        if (!identity.identity.onboarding_completed || !identity.identity.activeBond?.capacity) {
          return { isReady: false, localGuestId: identity.session.id };
        }
        setGuestScope(identity.session.id);
        if (isLocalGuestSessionId(identity.session.id)) {
          return { isReady: true, localGuestId: identity.session.id };
        }
        const lease = await getOrCreateGuestLease(identity.session.id);
        return { isReady: !lease.isExpired, localGuestId: identity.session.id };
      })
      .then((next) => {
        if (active) {
          setState(
            next
              ? { isLoading: false, ...next }
              : { isLoading: false, isReady: false, localGuestId: null },
          );
        }
      })
      .catch((error: unknown) => {
        console.warn('[entry] unable to restore local guest admission state:', error);
        if (active) setState({ isLoading: false, isReady: false, localGuestId: null });
      });

    return () => {
      active = false;
    };
  }, [isAnonymous, isSessionLoading, onboardingCompleted, session]);

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
  const profile = useAuthStore((state) => state.user);
  const scopeSnapshot = useScopeSessionStore((state) => state.snapshot);
  const scopeTransitioning = useScopeSessionStore((state) => state.isTransitioning);
  const onboardingCompleted = useAuthStore((state) => Boolean(state.user?.onboarding_completed));
  const profileBelongsToSession = Boolean(
    profile?.id && isResolvedAuthSubjectCurrent(resolvedAuthSubjectId, session?.user.id),
  );
  const entitlementScopeIsCurrent =
    !scopeTransitioning && scopeSnapshot?.principalId === (profile?.id ?? null);
  const activeBond = entitlementScopeIsCurrent ? (scopeSnapshot?.activeBond ?? null) : null;
  const hasLiveCapacity = Boolean(profileBelongsToSession && activeBond?.capacity);
  const activeCapacity = profileBelongsToSession ? (activeBond?.capacity ?? null) : null;
  const hasProfileName = Boolean(profileBelongsToSession && profile?.display_name?.trim());
  const entitlement = useEntitlementQuery(
    profileBelongsToSession ? (profile?.id ?? null) : null,
    {
      activeBondId: activeBond?.id ?? null,
      activeEntityId: activeBond?.entity_id ?? null,
      activeEntityType: activeBond?.entity_type ?? null,
    },
    Boolean(
      profileBelongsToSession &&
        entitlementScopeIsCurrent &&
        identityAvailability === 'active' &&
        getSessionIdentityMode(session) === 'authenticated',
    ),
  );
  const { manifestLoaded, readiness, snapshotUserId } = entitlement;
  const localGuest = useLocalGuestRouteState(session, onboardingCompleted, loading);
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
    onboardingCompleted:
      isAnonymous || localGuest.localGuestId ? localGuest.isReady : onboardingCompleted,
    pathname,
    profileError,
    session,
    hasLiveCapacity,
    activeCapacity,
    hasProfileName,
    principalId: profileBelongsToSession ? (profile?.id ?? null) : null,
    isProfileForSession: profileBelongsToSession,
    entitlement: { manifestLoaded, readiness, snapshotUserId },
    isGuestRouteStateLoading: (isAnonymous || session === null) && localGuest.isLoading,
    hasLocalGuestSession: Boolean(localGuest.localGuestId),
    isLocalGuestReady: localGuest.isReady,
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
      hasLocalGuestSession: state.hasLocalGuestSession,
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
    sessionUserId: state.principalId ?? undefined,
    snapshotUserId: state.entitlement.snapshotUserId,
    manifestLoaded: state.entitlement.manifestLoaded,
    readiness: state.entitlement.readiness,
  });
  const readiness = getSessionRouteReadiness({
    isSessionLoading: state.isSessionLoading && !state.hasLocalGuestSession,
    isProfileResolving: state.isProfileResolving,
    hasProfileError: Boolean(state.profileError),
    hasSession: Boolean(state.session) || Boolean(state.hasLocalGuestSession),
    guestOnboardingIntent: options.guestOnboardingIntent,
    hasCachedCapabilities: hasCachedCapabilities || Boolean(state.isLocalGuestReady),
    hasLiveCapacity: state.hasLiveCapacity || Boolean(state.isLocalGuestReady),
  });

  return getAuthRouteTarget({
    bootstrapReady: readiness.routeGuardReady,
    hasActiveCapacity: readiness.hasActiveCapacity,
    hasActiveAccessToken: state.hasActiveAccessToken,
    hasSession: Boolean(state.session),
    hasLocalGuestSession: state.hasLocalGuestSession,
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
