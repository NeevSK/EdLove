import { captureAuthenticatedDeviceAccount } from '@repo/core/accounts/authenticatedAccountCapture';
import { deviceAccounts } from '@repo/core/accounts/deviceAccounts';
import { disconnectPowerSync } from '@repo/core/adapters/powersync/database';
import { supabaseClient } from '@repo/core/adapters/supabaseClient';
import { authAPI } from '@repo/core/api/auth';
import { assertHighway } from '@repo/core/api/highways';
import { identityAPI } from '@repo/core/api/identity';
import type { SchoolType } from '@repo/core/constants/SriLankanSchools';
import {
  getSessionIdentityMode,
  type IdentityAvailability,
  isCurrentAuthBootstrapGeneration,
  isCurrentIdentityResolutionGeneration,
} from '@repo/core/logic/auth/identityState';
import { resolveAuthProfile } from '@repo/core/logic/auth/profileResolution';
import type { AccountLifecycleStatus } from '@repo/core/logic/ports/auth.port';
import { clearAuthSubject, identifyAuthSubject, initSentry } from '@repo/core/monitoring';
import { useStore } from '@repo/core/store/useStore';
import type { User } from '@repo/core/types';
import { APIError } from '@repo/core/types/API';
import type { Bond } from '@repo/core/types/Identity';
import type { Session } from '@supabase/supabase-js';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

export { getVerifiedDeviceAccountProfile } from '@repo/core/accounts/authenticatedAccountCapture';

/** Throttle minimum interval for mobile AppState wake-up profile reconciliation. */
const APP_STATE_RECONCILE_THROTTLE_MS = 60_000;

/**
 * useAuthLifecycle
 *
 * Orchestrates the "Reactive Capability Sync" and session management.
 * Hardened for offline cold start, battery doze mode, and mobile token churn.
 */
export function useAuthLifecycle() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isProfileResolving, setIsProfileResolving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [identityAvailability, setIdentityAvailability] = useState<IdentityAvailability>('unknown');
  const [resolvedAuthSubjectId, setResolvedAuthSubjectId] = useState<string | null>(null);
  const [accountLifecycleStatus, setAccountLifecycleStatus] =
    useState<AccountLifecycleStatus | null>(null);

  const hasBootstrappedRef = useRef(false);
  const authEventGenerationRef = useRef(0);
  const identityResolutionGenerationRef = useRef(0);
  const resolvedAuthSubjectIdRef = useRef<string | null>(null);
  const capturedSessionKeysRef = useRef(new Set<string>());
  const capturingSessionKeysRef = useRef(new Set<string>());
  const previousUserIdRef = useRef<string | null>(null);
  const lastReconciledAtRef = useRef<number>(Date.now());

  const setUser = useStore((state) => state.setUser);
  const setPerspective = useStore((state) => state.setPerspective);
  const setAvailableBonds = useStore((state) => state.setAvailableBonds);
  const setSchoolType = useStore((state) => state.setSchoolType);
  const setOnboardingCompleted = useStore((state) => state.setOnboardingCompleted);
  const setAuthSession = useStore((state) => state.setAuthSession);
  const setAuthSessionResolved = useStore((state) => state.setAuthSessionResolved);
  const setDemoMode = useStore((state) => state.setDemoMode);

  const clearDerivedIdentityState = useCallback(() => {
    setUser(null);
    setPerspective(null);
    setAvailableBonds([]);
    setSchoolType(null);
    setOnboardingCompleted(false);
    setIdentityAvailability('unknown');
    resolvedAuthSubjectIdRef.current = null;
    setResolvedAuthSubjectId(null);
    setAccountLifecycleStatus(null);
  }, [
    setAccountLifecycleStatus,
    setAvailableBonds,
    setIdentityAvailability,
    setResolvedAuthSubjectId,
    setOnboardingCompleted,
    setPerspective,
    setSchoolType,
    setUser,
  ]);

  const hasVerifiedLocalIdentityForSubject = useCallback(
    async (
      accountId: string | null | undefined,
      authSubjectId: string | null,
    ): Promise<boolean> => {
      if (!accountId || !authSubjectId) {
        return false;
      }

      if (resolvedAuthSubjectIdRef.current === authSubjectId) {
        return true;
      }

      try {
        const accounts = await deviceAccounts.list();
        return accounts.some(
          (account) => account.accountId === accountId && account.authUserId === authSubjectId,
        );
      } catch (error) {
        console.warn('[auth] unable to verify the remembered account owner:', error);
        return false;
      }
    },
    [],
  );

  const fetchAndSetUserProfile = useCallback(
    async (sessionToCapture?: Session | null) => {
      // Only block the UI with a loading spinner on the very first boot fetch.
      // All subsequent fetches (tab focus, token refresh) run silently.
      const isFirstLoad = !hasBootstrappedRef.current;
      const resolutionGeneration = identityResolutionGenerationRef.current + 1;
      identityResolutionGenerationRef.current = resolutionGeneration;
      const authSubjectId = sessionToCapture?.user.id ?? null;
      setIsProfileResolving(true);
      setProfileError(null);
      if (isFirstLoad) {
        setIsProfileLoading(true);
      }
      try {
        const resolution = await resolveAuthProfile(sessionToCapture ?? null, {
          identifyActiveCitizen: async () => {
            assertHighway('identity_bootstrap', 'direct-api');
            return identityAPI.identifyActiveCitizen();
          },
          getAccountLifecycleStatus: () => authAPI.getAccountLifecycleStatus(),
          getSchoolType: async (schoolId) => {
            const { data: schoolData } = await supabaseClient
              .from('schools')
              .select('type')
              .eq('id', schoolId)
              .single();
            return (schoolData?.type as SchoolType | undefined) ?? null;
          },
        });

        if (
          !isCurrentIdentityResolutionGeneration(
            resolutionGeneration,
            identityResolutionGenerationRef.current,
          )
        ) {
          return;
        }

        if (resolution.kind === 'active') {
          const { identity, schoolType } = resolution;
          setIdentityAvailability('active');
          resolvedAuthSubjectIdRef.current = authSubjectId;
          setResolvedAuthSubjectId(authSubjectId);
          setAccountLifecycleStatus(null);
          setUser(identity as unknown as User);
          setAvailableBonds(identity.availableBonds as unknown as Bond[]);
          setPerspective({
            activeBond: identity.activeBond as unknown as Bond | undefined,
            availableBonds: identity.availableBonds as unknown as Bond[],
          });

          await captureAuthenticatedDeviceAccount({
            capturedSessionKeys: capturedSessionKeysRef.current,
            capturingSessionKeys: capturingSessionKeysRef.current,
            identity,
            resolvedAuthSubjectId: authSubjectId,
            session: sessionToCapture ?? null,
          });

          setOnboardingCompleted(Boolean(identity.onboarding_completed));
          setSchoolType(schoolType);

          identifyAuthSubject({
            id: identity.id,
            email: identity.email,
            displayName: identity.display_name,
          });
        } else if (resolution.kind === 'inactive') {
          clearDerivedIdentityState();
          setAccountLifecycleStatus(resolution.accountLifecycleStatus);
          setIdentityAvailability('inactive');
          resolvedAuthSubjectIdRef.current = authSubjectId;
          setResolvedAuthSubjectId(authSubjectId);
          void disconnectPowerSync().catch((err) => {
            console.warn(
              '[useAuthLifecycle] unable to disconnect PowerSync for inactive identity',
              err,
            );
          });
        } else {
          // resolution.kind === 'unavailable'
          // Non-destructive offline fallback: If a valid local user exists in persisted storage,
          // preserve their offline state and mark identity active rather than kicking them to onboarding.
          const existingUser = useStore.getState().user;
          const hasMatchingLocalUser = await hasVerifiedLocalIdentityForSubject(
            existingUser?.id,
            authSubjectId,
          );

          if (hasMatchingLocalUser) {
            setIdentityAvailability('active');
            resolvedAuthSubjectIdRef.current = authSubjectId;
            setResolvedAuthSubjectId(authSubjectId);
          } else {
            clearDerivedIdentityState();
          }

          if (resolution.profileError) {
            setProfileError(resolution.profileError);
          }
        }
      } catch (error) {
        console.warn('❌ Profile: Fetching encountered an error:', error);
        const existingUser = useStore.getState().user;
        if (await hasVerifiedLocalIdentityForSubject(existingUser?.id, authSubjectId)) {
          setIdentityAvailability('active');
          resolvedAuthSubjectIdRef.current = authSubjectId;
          setResolvedAuthSubjectId(authSubjectId);
        } else {
          clearDerivedIdentityState();
        }
        setProfileError(error instanceof Error ? error.message : 'Unable to restore your profile.');
      } finally {
        if (
          isCurrentIdentityResolutionGeneration(
            resolutionGeneration,
            identityResolutionGenerationRef.current,
          )
        ) {
          setIsProfileResolving(false);
          if (isFirstLoad) {
            setIsProfileLoading(false);
          }
          // Mark bootstrap as complete after the first attempt, whether it succeeded
          // or failed — so tab switches never trigger the spinner again.
          hasBootstrappedRef.current = true;
        }
      }
    },
    [
      clearDerivedIdentityState,
      hasVerifiedLocalIdentityForSubject,
      setUser,
      setPerspective,
      setAvailableBonds,
      setSchoolType,
      setOnboardingCompleted,
    ],
  );

  const refreshProfile = useCallback(async () => {
    const currentSession = (await authAPI.getAuthSession()) as Session | null;
    await fetchAndSetUserProfile(currentSession);
  }, [fetchAndSetUserProfile]);

  useEffect(() => {
    // 1. Initialize error monitoring. Product analytics is initialized by the
    // application shell so there is only one provider/transport instance.
    initSentry();

    // 2. Initial Session Check
    const checkSession = async () => {
      const bootstrapGeneration = authEventGenerationRef.current;
      try {
        const initialSession = (await authAPI.getAuthSession()) as Session | null;
        if (
          !isCurrentAuthBootstrapGeneration(bootstrapGeneration, authEventGenerationRef.current)
        ) {
          return;
        }
        setSession(initialSession);
        setAuthSession(initialSession);
        previousUserIdRef.current = initialSession?.user?.id ?? null;

        const sessionMode = getSessionIdentityMode(initialSession);
        if (sessionMode === 'authenticated' || sessionMode === 'anonymous') {
          await fetchAndSetUserProfile(initialSession);
        } else if (initialSession?.user) {
          clearDerivedIdentityState();
        }
      } catch (error) {
        if (error instanceof APIError) {
          if (
            error.message?.includes('Refresh Token') ||
            (error as { status?: number }).status === 400
          ) {
            await supabaseClient.auth.signOut({ scope: 'local' });
            setSession(null);
            setAuthSession(null);
          }
        }
      } finally {
        setLoading(false);
        setAuthSessionResolved(true);
      }
    };

    // 3. Register before reading the initial session. The session request crosses
    // an asynchronous boundary, so subscribing first prevents a sign-in/out event
    // from being lost while the initial request is in flight.
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange(async (event, currentSession) => {
      authEventGenerationRef.current += 1;
      setSession(currentSession);
      setAuthSession(currentSession);
      setAuthSessionResolved(true);

      const currentUserId = currentSession?.user?.id ?? null;
      const isTokenOnlyRefresh =
        event === 'TOKEN_REFRESHED' &&
        currentUserId !== null &&
        currentUserId === previousUserIdRef.current;

      previousUserIdRef.current = currentUserId;

      if (isTokenOnlyRefresh) {
        // Only the auth token refreshed in the background for the same active user.
        // Skip redundant remote RPCs to preserve radio bandwidth and battery.
        return;
      }

      const currentMode = getSessionIdentityMode(currentSession);
      if (currentMode === 'authenticated' || currentMode === 'anonymous') {
        await fetchAndSetUserProfile(currentSession);
      } else if (currentSession?.user) {
        setUser(null);
        setPerspective(null);
        setAvailableBonds([]);
        setSchoolType(null);
        setOnboardingCompleted(false);
        setIdentityAvailability('unknown');
        setAccountLifecycleStatus(null);
      } else if (event === 'SIGNED_OUT') {
        clearAuthSubject();
        clearDerivedIdentityState();
        setDemoMode(false);
      } else if (currentSession) {
        setDemoMode(false);
      }
    });

    // 4. Mobile AppState Wake-Up Reconciler
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        const now = Date.now();
        if (now - lastReconciledAtRef.current >= APP_STATE_RECONCILE_THROTTLE_MS) {
          lastReconciledAtRef.current = now;
          refreshProfile().catch((e) => {
            console.warn('Auth: Background AppState profile refresh failed', e);
          });
        }
      }
    };

    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    checkSession().catch((e) => {
      console.error('Auth: Critical session check failed', e);
    });

    return () => {
      subscription.unsubscribe();
      appStateSubscription.remove();
    };
  }, [
    setAuthSession,
    setAuthSessionResolved,
    clearDerivedIdentityState,
    fetchAndSetUserProfile,
    refreshProfile,
    setDemoMode,
    setUser,
    setPerspective,
    setAvailableBonds,
    setSchoolType,
    setOnboardingCompleted,
  ]);

  // 4. Realtime Profile Updates (Capability Sync)
  const currentUser = useStore((state) => state.user);
  useEffect(() => {
    if (!currentUser?.id) return;

    const channel = supabaseClient
      .channel(`user-profile-sync-${currentUser.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${currentUser.id}`,
        },
        () => {
          refreshProfile().catch((e) => {
            console.error('Auth: Profile refresh failed after remote update', e);
          });
        },
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel).catch((e) => {
        console.error('Auth: Failed to remove channel during cleanup', e);
      });
    };
  }, [currentUser?.id, refreshProfile]);

  return useMemo(
    () => ({
      session,
      loading,
      isProfileLoading,
      isProfileResolving,
      profileError,
      identityAvailability,
      resolvedAuthSubjectId,
      accountLifecycleStatus,
      refreshProfile,
    }),
    [
      session,
      loading,
      isProfileLoading,
      isProfileResolving,
      profileError,
      identityAvailability,
      resolvedAuthSubjectId,
      accountLifecycleStatus,
      refreshProfile,
    ],
  );
}
