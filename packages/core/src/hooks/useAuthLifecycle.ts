import type { Session } from '@supabase/supabase-js';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { authAPI } from '@/api/auth';
import { assertHighway } from '@/api/highways';
import { identityAPI } from '@/api/identity';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from '@/api/supabase';
import type { SchoolType } from '@/constants/SriLankanSchools';
import { identifyUser } from '@/lib/monitoring/posthog';
import { clearSentryUser, initSentry, setSentryUser } from '@/lib/monitoring/sentry';
import { getSessionIdentityMode } from '@/logic/auth/identityState';
import { useStore } from '@/store/useStore';
import type { User } from '@/types';
import { APIError } from '@/types/API';
import type { Bond } from '@/types/Identity';

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

  const setUser = useStore((state) => state.setUser);
  const setPerspective = useStore((state) => state.setPerspective);
  const setAvailableBonds = useStore((state) => state.setAvailableBonds);
  const setSchoolType = useStore((state) => state.setSchoolType);
  const setOnboardingCompleted = useStore((state) => state.setOnboardingCompleted);
  const setAuthSession = useStore((state) => state.setAuthSession);
  const setAuthSessionResolved = useStore((state) => state.setAuthSessionResolved);
  const setDemoMode = useStore((state) => state.setDemoMode);

  const fetchAndSetUserProfile = useCallback(async () => {
    setIsProfileLoading(true);
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
          const { data: schoolData } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
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
    } finally {
      setIsProfileLoading(false);
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

        if (getSessionIdentityMode(initialSession) === 'authenticated') {
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
            await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__.auth.signOut({ scope: 'local' });
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
    } = __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setAuthSession(currentSession);
        setAuthSessionResolved(true);

        if (getSessionIdentityMode(currentSession) === 'authenticated') {
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

    const channel = __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
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
      __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__.removeChannel(channel).catch((e) => {
        console.error('Auth: Failed to remove channel during cleanup', e);
      });
    };
  }, [currentUser?.id, refreshProfile]);

  return useMemo(
    () => ({ session, loading, isProfileLoading, refreshProfile }),
    [session, loading, isProfileLoading, refreshProfile],
  );
}
