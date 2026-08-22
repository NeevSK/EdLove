import type { Session } from '@supabase/supabase-js';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { authAPI } from '@repo/core/api/auth';
import { assertHighway } from '@repo/core/api/highways';
import { identityAPI } from '@repo/core/api/identity';
import { supabaseClient } from '@repo/core/adapters/supabaseClient';
import type { SchoolType } from '@repo/core/constants/SriLankanSchools';
import { identifyUser } from '@repo/core/lib/monitoring/posthog';
import { clearSentryUser, initSentry, setSentryUser } from '@repo/core/lib/monitoring/sentry';
import { getSessionIdentityMode } from '@repo/core/logic/auth/identityState';
import { useStore } from '@repo/core/store/useStore';
import type { User } from '@repo/core/types';
import { APIError } from '@repo/core/types/API';
import type { Bond } from '@repo/core/types/Identity';

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

  // Tracks whether the very first profile load has completed successfully.
  // After that, subsequent tab-focus/token-refresh fetches run silently
  // without toggling isProfileLoading, preventing the blank screen on tab switch.
  const hasBootstrappedRef = useRef(false);

  const setUser = useStore((state) => state.setUser);
  const setPerspective = useStore((state) => state.setPerspective);
  const setAvailableBonds = useStore((state) => state.setAvailableBonds);
  const setSchoolType = useStore((state) => state.setSchoolType);
  const setOnboardingCompleted = useStore((state) => state.setOnboardingCompleted);
  const setAuthSession = useStore((state) => state.setAuthSession);
  const setAuthSessionResolved = useStore((state) => state.setAuthSessionResolved);
  const setDemoMode = useStore((state) => state.setDemoMode);

  const fetchAndSetUserProfile = useCallback(async () => {
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
        // 2. Update Store with ReBAC data
        // Cast simplified bonds to full Bond type - the store layer fills in additional fields
        setUser(identity as unknown as User);
        setAvailableBonds(identity.availableBonds as unknown as Bond[]);

        // Re-calculate perspective from bonds
        setPerspective({
          activeBond: identity.activeBond as unknown as Bond | undefined,
          availableBonds: identity.availableBonds as unknown as Bond[],
        });

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
  }, [setUser, setPerspective, setAvailableBonds, setSchoolType, setOnboardingCompleted]);

  const refreshProfile = useCallback(async () => {
    await fetchAndSetUserProfile();
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
          await fetchAndSetUserProfile();
        } else if (initialSession?.user) {
          setUser(null);
          setPerspective(null);
          setAvailableBonds([]);
          setSchoolType(null);
          setOnboardingCompleted(false);
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
    } = supabaseClient.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setAuthSession(currentSession);
        setAuthSessionResolved(true);

        const currentMode = getSessionIdentityMode(currentSession);
        if (currentMode === 'authenticated' || currentMode === 'anonymous') {
          await fetchAndSetUserProfile();
        } else if (currentSession?.user) {
          setUser(null);
          setPerspective(null);
          setAvailableBonds([]);
          setSchoolType(null);
          setOnboardingCompleted(false);
        } else if (event === 'SIGNED_OUT') {
          clearSentryUser();
          setUser(null);
          setPerspective(null);
          setAvailableBonds([]);
          setSchoolType(null);
          setOnboardingCompleted(false);
          setDemoMode(false);
        } else if (currentSession) {
          setDemoMode(false);
        }
      },
    );

    return () => subscription.unsubscribe();
  }, [
    setAuthSession,
    setAuthSessionResolved,
    setUser,
    setPerspective,
    setAvailableBonds,
    setSchoolType,
    setOnboardingCompleted,
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
      refreshProfile,
    }),
    [session, loading, isProfileLoading, isProfileResolving, profileError, refreshProfile],
  );
}
