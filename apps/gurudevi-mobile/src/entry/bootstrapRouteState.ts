import {
  getAuthRouteTarget,
  getSessionIdentityMode,
  type IdentityAvailability,
  isResolvedAuthSubjectCurrent,
  useAuth,
  useStore,
} from '@repo/core/logic';
import { useEntitlementStore } from '@repo/core/store/useEntitlementStore';
import type { Session } from '@supabase/supabase-js';

import {
  getSessionRouteReadiness,
  hasUsableOfflineCapabilitySnapshot,
} from '@/boot/sessionRouteReadiness';

export type BootstrapRouteState = {
  hasActiveAccessToken: boolean;
  identityAvailability: IdentityAvailability;
  isProfileResolving: boolean;
  isSessionLoading: boolean;
  onboardingCompleted: boolean;
  pathname: string;
  profileError: string | null;
  session: Session | null;
  hasLiveCapacity: boolean;
  hasProfileName: boolean;
  isProfileForSession: boolean;
  entitlement: Pick<
    ReturnType<typeof useEntitlementStore.getState>,
    'manifestLoaded' | 'readiness' | 'snapshotUserId'
  >;
};

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
  const hasProfileName = Boolean(profileBelongsToSession && profile?.display_name?.trim());
  const { manifestLoaded, readiness, snapshotUserId } = useEntitlementStore();
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
    onboardingCompleted,
    pathname,
    profileError,
    session,
    hasLiveCapacity,
    hasProfileName,
    isProfileForSession: profileBelongsToSession,
    entitlement: { manifestLoaded, readiness, snapshotUserId },
  };
}

export function getBootstrapRouteTarget(
  state: BootstrapRouteState,
  options: { guestOnboardingIntent?: boolean } = {},
) {
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
    hasCachedCapabilities,
    hasLiveCapacity: state.hasLiveCapacity,
  });

  return getAuthRouteTarget({
    bootstrapReady: readiness.routeGuardReady,
    hasActiveCapacity: readiness.hasActiveCapacity,
    hasActiveAccessToken: state.hasActiveAccessToken,
    hasSession: Boolean(state.session),
    identityAvailability: state.identityAvailability,
    hasProfileForSession: state.isProfileForSession,
    hasProfileName: state.hasProfileName,
    onboardingCompleted: state.onboardingCompleted,
    pathname: state.pathname,
    sessionMode: getSessionIdentityMode(state.session),
  });
}
