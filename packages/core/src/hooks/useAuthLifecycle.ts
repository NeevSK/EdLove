import {
  captureAuthenticatedDeviceAccount,
  getVerifiedDeviceAccountProfile,
} from '@repo/core/accounts/authenticatedAccountCapture';
import { supabaseClient } from '@repo/core/adapters/supabaseClient';
import { authAPI } from '@repo/core/api/auth';
import { assertHighway } from '@repo/core/api/highways';
import { identityAPI } from '@repo/core/api/identity';
import type { SchoolType } from '@repo/core/constants/SriLankanSchools';
import {
  getSessionIdentityMode,
  type IdentityAvailability,
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

export { getVerifiedDeviceAccountProfile } from '@repo/core/accounts/authenticatedAccountCapture';

/**
 * useAuthLifecycle
 *
 * Orchestrates the "Reactive Capability Sync" and session management.
 * This is the heart of the POA system's reactivity.
 */
export function useAuthLifecycle() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isProfileResolving, setIsProfileResolving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [identityAvailability, setIdentityAvailability] = useState<IdentityAvailability>('unknown');
  const [accountLifecycleStatus, setAccountLifecycleStatus] =
    useState<AccountLifecycleStatus | null>(null);

  const hasBootstrappedRef = useRef(false);
  const capturedSessionKeysRef = useRef(new Set<string>());
  const capturingSessionKeysRef = useRef(new Set<string>());

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
    setAccountLifecycleStatus(null);
  }, [
    setAccountLifecycleStatus,
    setAvailableBonds,
    setIdentityAvailability,
    setOnboardingCompleted,
    setPerspective,
    setSchoolType,
    setUser,
  ]);

  const fetchAndSetUserProfile = useCallback(
    async (sessionToCapture?: Session | null) => {
      // Only block the UI with a loading spinner on the very first boot fetch.
      // All subsequent fetches (tab focus, token refresh) run silently.
      const isFirstLoad = !hasBootstrappedRef.current;
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

        if (resolution.kind === 'active') {
          const { identity, schoolType } = resolution;
          setIdentityAvailability('active');
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
        } else {
          clearDerivedIdentityState();
          if (resolution.profileError) {
            setProfileError(resolution.profileError);
          }
        }
      } catch (error) {
        console.warn('❌ Profile: Fetching encountered an error:', error);
        setProfileError(error instanceof Error ? error.message : 'Unable to restore your profile.');
      } finally {
        setIsProfileResolving(false);
        if (isFirstLoad) {
          setIsProfileLoading(false);
        }
        // Mark bootstrap as complete after the first attempt, whether it succeeded
        // or failed — so tab switches never trigger the spinner again.
        hasBootstrappedRef.current = true;
      }
    },
    [
      clearDerivedIdentityState,
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
      try {
        const initialSession = (await authAPI.getAuthSession()) as Session | null;
        setSession(initialSession);
        setAuthSession(initialSession);

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
      setSession(currentSession);
      setAuthSession(currentSession);
      setAuthSessionResolved(true);

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

    checkSession().catch((e) => {
      console.error('Auth: Critical session check failed', e);
    });

    return () => subscription.unsubscribe();
  }, [
    setAuthSession,
    setAuthSessionResolved,
    clearDerivedIdentityState,
    fetchAndSetUserProfile,
    setDemoMode,
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
      accountLifecycleStatus,
      refreshProfile,
    ],
  );
}
