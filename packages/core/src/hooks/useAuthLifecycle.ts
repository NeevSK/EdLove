import { type DeviceAccountProfile, deviceAccounts } from '@repo/core/accounts/deviceAccounts';
import { supabaseClient } from '@repo/core/adapters/supabaseClient';
import { authAPI } from '@repo/core/api/auth';
import { assertHighway } from '@repo/core/api/highways';
import { type ActiveCitizen, identityAPI } from '@repo/core/api/identity';
import type { SchoolType } from '@repo/core/constants/SriLankanSchools';
import {
  getSessionIdentityMode,
  type IdentityAvailability,
} from '@repo/core/logic/auth/identityState';
import type { AccountLifecycleStatus } from '@repo/core/logic/ports/auth.port';
import { clearSentryUser, identifyUser, initSentry, setSentryUser } from '@repo/core/monitoring';
import { useStore } from '@repo/core/store/useStore';
import type { User } from '@repo/core/types';
import { APIError } from '@repo/core/types/API';
import type { Bond } from '@repo/core/types/Identity';
import type { Session } from '@supabase/supabase-js';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/**
 * A device account is only durable after the authenticated Supabase session
 * and the resolved Gurudevi identity agree on the same principal. This keeps
 * anonymous, sandbox, stale, and partially-resolved sessions out of the
 * shared-device registry.
 */
export function getVerifiedDeviceAccountProfile(
  session: Session | null,
  identity: ActiveCitizen | null,
): DeviceAccountProfile | null {
  if (
    !session?.user ||
    getSessionIdentityMode(session) !== 'authenticated' ||
    !identity ||
    identity.id !== session.user.id
  ) {
    return null;
  }

  return {
    id: identity.id,
    email: identity.email,
    display_name: identity.display_name,
    avatar_url: null,
    capacity: identity.activeBond?.capacity ?? null,
    school_id: identity.schoolId ?? null,
  };
}

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
        assertHighway('identity_bootstrap', 'direct-api');
        // 1. Resolve Sovereign Identity (Bonds & Perspectives)
        // [SOVEREIGN-SIPHON] unified into identifyActiveCitizen
        const identity = await identityAPI.identifyActiveCitizen();

        if (identity) {
          setIdentityAvailability('active');
          setAccountLifecycleStatus(null);
          // 2. Update Store with ReBAC data
          // Cast simplified bonds to full Bond type - the store layer fills in additional fields
          setUser(identity as unknown as User);
          setAvailableBonds(identity.availableBonds as unknown as Bond[]);

          // Re-calculate perspective from bonds
          setPerspective({
            activeBond: identity.activeBond as unknown as Bond | undefined,
            availableBonds: identity.availableBonds as unknown as Bond[],
          });

          const deviceAccountProfile = getVerifiedDeviceAccountProfile(
            sessionToCapture ?? null,
            identity,
          );
          const captureKey = sessionToCapture
            ? `${sessionToCapture.user.id}:${sessionToCapture.access_token}`
            : null;
          if (
            deviceAccountProfile &&
            captureKey &&
            !capturedSessionKeysRef.current.has(captureKey) &&
            !capturingSessionKeysRef.current.has(captureKey)
          ) {
            capturingSessionKeysRef.current.add(captureKey);
            try {
              await deviceAccounts.captureCurrentAccount(
                sessionToCapture ?? null,
                deviceAccountProfile,
              );
              capturedSessionKeysRef.current.add(captureKey);
            } catch (error) {
              // A registry failure must not invalidate an otherwise verified
              // session. Leaving the key uncaptured permits a later auth refresh
              // to retry without duplicating successful captures.
              console.warn('[auth] Device account capture deferred:', error);
            } finally {
              capturingSessionKeysRef.current.delete(captureKey);
            }
          }

          // 3. Handle Onboarding & School Logic
          const isEffectivelyOnboarded = !!identity.onboarding_completed;
          if (isEffectivelyOnboarded) {
            setOnboardingCompleted(true);
          }

          const schoolId = identity.schoolId || null;
          if (schoolId) {
            const { data: schoolData } = await supabaseClient
              .from('schools')
              .select('type')
              .eq('id', schoolId)
              .single();

            if (schoolData) {
              setSchoolType(schoolData.type as SchoolType | null);
            }
          } else {
            setSchoolType(null);
          }

          // 4. Monitoring identification (Relationship-aware)
          setSentryUser({
            id: identity.id,
            email: identity.email,
            username: identity.display_name,
          });

          identifyUser(identity.id);
        } else {
          // A soft-deactivated profile is intentionally not an active identity.
          // Clear derived state so stale local data cannot keep rendering the app
          // shell while the auth session is still present.
          setUser(null);
          setPerspective(null);
          setAvailableBonds([]);
          setSchoolType(null);
          setOnboardingCompleted(false);
          setAccountLifecycleStatus(null);
          if (getSessionIdentityMode(sessionToCapture) === 'authenticated') {
            const lifecycleStatus = await authAPI.getAccountLifecycleStatus();
            setAccountLifecycleStatus(lifecycleStatus);
            if (lifecycleStatus.status === 'deactivated') {
              setIdentityAvailability('inactive');
            } else {
              setIdentityAvailability('unknown');
              setProfileError('Unable to restore your account profile.');
            }
          } else {
            setIdentityAvailability('unknown');
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
    [setUser, setPerspective, setAvailableBonds, setSchoolType, setOnboardingCompleted],
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
          setUser(null);
          setPerspective(null);
          setAvailableBonds([]);
          setSchoolType(null);
          setOnboardingCompleted(false);
          setIdentityAvailability('unknown');
          setAccountLifecycleStatus(null);
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

    checkSession().catch((e) => {
      console.error('Auth: Critical session check failed', e);
    });

    // 3. Auth State Change Listener
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
        clearSentryUser();
        setUser(null);
        setPerspective(null);
        setAvailableBonds([]);
        setSchoolType(null);
        setOnboardingCompleted(false);
        setIdentityAvailability('unknown');
        setAccountLifecycleStatus(null);
        setDemoMode(false);
      } else if (currentSession) {
        setDemoMode(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [
    setAuthSession,
    setAuthSessionResolved,
    setUser,
    setPerspective,
    setAvailableBonds,
    setSchoolType,
    setOnboardingCompleted,
    setIdentityAvailability,
    setAccountLifecycleStatus,
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
