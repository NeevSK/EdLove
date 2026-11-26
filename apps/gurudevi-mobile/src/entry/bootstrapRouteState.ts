import { deviceAccounts } from '@repo/core';
import type { EntitlementReadiness } from '@repo/core/logic/ports/entitlement.port';
import {
  DEFAULT_LANDING_POLICY,
  type LandingPolicyConfig,
  type LastVisitedPlaceRecord,
  resolveAppLandingRoute,
} from '@repo/core/logic/places/landingPolicy';
import { useOfflineStatus } from '@repo/core/offline/useOfflineStatus';
import {
  getAuthRouteTarget,
  getSessionIdentityMode,
  type IdentityAvailability,
  isResolvedAuthSubjectCurrent,
  useAuth,
} from '@repo/core/logic';
import type { AuthSession } from '@repo/core/types/authSession';
import { setGuestScope } from '@repo/core/native/guestScope';
import { activateLocalGuestSession } from '@repo/core/accounts/localGuestActivation.coordinator';
import { restoreLocalGuestSession } from '@repo/core/native/localGuestSession';
import {
  entitlementQueryKey,
  isEntitlementSnapshotFresh,
  isIdentity,
  normalizeIdentity,
  type QualifiedEntitlementSnapshot,
} from '@repo/core/store/queries/entitlementQuery';
import { useScopeSessionStore } from '@repo/core/store/scopeSession';
import { useAuthStore } from '@repo/core/store/useAuthStore';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import {
  getSessionRouteReadiness,
  hasUsableOfflineCapabilitySnapshot,
} from '@/boot/sessionRouteReadiness';
import { readLastVisitedPlace } from '@/entry/lastVisitedPlace';

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
  activeBondId?: string | null;
  isOfflineWithVerifiedProfile?: boolean;
  lastVisitedPlace?: LastVisitedPlaceRecord | null;
  isProfileForSession: boolean;
  entitlement: {
    manifestLoaded: boolean;
    readiness: EntitlementReadiness;
    snapshotUserId: string | null;
  };
  isGuestRouteStateLoading?: boolean;
  hasLocalGuestSession?: boolean;
  isLocalGuestReady?: boolean;
  hasRememberedAccounts?: boolean;
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
  refreshNonce: number,
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
        return { isReady: true, localGuestId: identity.session.id };
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
  }, [isAnonymous, isSessionLoading, onboardingCompleted, refreshNonce, session]);

  return state;
}

function useRememberedAccountsPresence(session: AuthSession | null): boolean {
  const [hasRememberedAccounts, setHasRememberedAccounts] = useState(false);

  useEffect(() => {
    if (session?.user && session.user.is_anonymous !== true) {
      return;
    }
    let active = true;
    void deviceAccounts
      .list()
      .then((accounts) => {
        if (active) setHasRememberedAccounts(accounts.length > 0);
      })
      .catch(() => {
        if (active) setHasRememberedAccounts(false);
      });
    return () => {
      active = false;
    };
  }, [session]);

  return hasRememberedAccounts;
}

function useLastVisitedPlaceForPrincipal(
  principalId: string | null,
): LastVisitedPlaceRecord | null {
  const [record, setRecord] = useState<LastVisitedPlaceRecord | null>(null);

  useEffect(() => {
    if (!principalId) return;
    let active = true;
    void readLastVisitedPlace(principalId).then((loaded) => {
      if (active) setRecord(loaded);
    });
    return () => {
      active = false;
    };
  }, [principalId]);

  return principalId ? record : null;
}

/**
 * Collects live and persisted bootstrap inputs into the one snapshot consumed
 * by the route policy. Screens should not reinterpret these sources directly.
 */
export function useBootstrapRouteState(
  pathname: string,
  localGuestRefreshNonce = 0,
): BootstrapRouteState {
  const { isOnline } = useOfflineStatus();
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
  // Read-only lookup of any already-cached entitlement snapshot for offline return.
  // Network entitlement hydration belongs exclusively to CapabilityHydrationProvider
  // (post-admission inside AuthenticatedAppServices), never inside the AuthN route gate.
  const queryClient = useQueryClient();
  const canReadCachedEntitlement = Boolean(
    profileBelongsToSession &&
      profile?.id &&
      entitlementScopeIsCurrent &&
      identityAvailability === 'active' &&
      getSessionIdentityMode(session) === 'authenticated',
  );
  const entitlementIdentity =
    canReadCachedEntitlement && profile?.id
      ? normalizeIdentity(profile.id, {
          activeBondId: activeBond?.id ?? null,
          activeEntityId: activeBond?.entity_id ?? null,
          activeEntityType: activeBond?.entity_type ?? null,
        })
      : null;
  const cachedSnapshot = entitlementIdentity
    ? queryClient.getQueryData<QualifiedEntitlementSnapshot>(
        entitlementQueryKey(entitlementIdentity),
      )
    : undefined;
  const validCachedSnapshot =
    cachedSnapshot &&
    entitlementIdentity &&
    isIdentity(cachedSnapshot.identity, entitlementIdentity) &&
    isEntitlementSnapshotFresh(cachedSnapshot.refreshedAt)
      ? cachedSnapshot
      : null;
  const manifestLoaded = validCachedSnapshot !== null;
  const readiness: EntitlementReadiness = validCachedSnapshot?.readiness ?? 'unknown';
  const snapshotUserId = validCachedSnapshot?.identity.principalId ?? null;
  const localGuest = useLocalGuestRouteState(
    session,
    onboardingCompleted,
    loading,
    localGuestRefreshNonce,
  );
  const hasRememberedAccounts = useRememberedAccountsPresence(session);
  const resolvedPrincipalId = profileBelongsToSession ? (profile?.id ?? null) : null;
  const lastVisitedPlace = useLastVisitedPlaceForPrincipal(
    resolvedPrincipalId ?? localGuest.localGuestId,
  );
  const isOfflineWithVerifiedProfile = Boolean(
    !isOnline && profileBelongsToSession && session?.user,
  );
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
    activeBondId: activeBond?.id ?? null,
    isOfflineWithVerifiedProfile,
    lastVisitedPlace,
    hasProfileName,
    principalId: resolvedPrincipalId,
    isProfileForSession: profileBelongsToSession,
    entitlement: { manifestLoaded, readiness, snapshotUserId },
    isGuestRouteStateLoading: (isAnonymous || session === null) && localGuest.isLoading,
    hasLocalGuestSession: Boolean(localGuest.localGuestId),
    isLocalGuestReady: localGuest.isReady,
    hasRememberedAccounts,
  };
}

export function getBootstrapRouteTarget(
  state: BootstrapRouteState,
  options: {
    guestOnboardingIntent?: boolean;
    landingPolicy?: LandingPolicyConfig;
    now?: number;
  } = {},
) {
  const appEntryPath = resolveAppLandingRoute(
    {
      activeCapacity: state.activeCapacity,
      bondId: state.activeBondId ?? null,
      lastVisited: state.lastVisitedPlace ?? null,
      now: options.now ?? Date.now(),
    },
    options.landingPolicy ?? DEFAULT_LANDING_POLICY,
  ).route;

  if (state.isGuestRouteStateLoading) {
    return getAuthRouteTarget({
      bootstrapReady: false,
      hasActiveCapacity: false,
      hasActiveAccessToken: state.hasActiveAccessToken,
      isOfflineWithVerifiedProfile: state.isOfflineWithVerifiedProfile,
      hasSession: Boolean(state.session),
      hasLocalGuestSession: state.hasLocalGuestSession,
      hasRememberedAccounts: state.hasRememberedAccounts,
      identityAvailability: state.identityAvailability,
      hasProfileForSession: state.isProfileForSession,
      hasProfileName: state.hasProfileName,
      onboardingCompleted: false,
      pathname: state.pathname,
      sessionMode: getSessionIdentityMode(state.session),
      guestOnboardingIntent: options.guestOnboardingIntent,
      appEntryPath,
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
    isOfflineWithVerifiedProfile: state.isOfflineWithVerifiedProfile,
    hasSession: Boolean(state.session),
    hasLocalGuestSession: state.hasLocalGuestSession,
    hasRememberedAccounts: state.hasRememberedAccounts,
    identityAvailability: state.identityAvailability,
    hasProfileForSession: state.isProfileForSession,
    hasProfileName: state.hasProfileName || Boolean(state.isLocalGuestReady),
    onboardingCompleted: state.onboardingCompleted,
    pathname: state.pathname,
    sessionMode: getSessionIdentityMode(state.session),
    guestOnboardingIntent: options.guestOnboardingIntent,
    appEntryPath,
  });
}
