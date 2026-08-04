import type { Session } from '@supabase/supabase-js';
import { Effect } from 'effect';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { setActiveCapabilityToken } from '@repo/core/adapters/powersync/database';
import { authAPI } from '@repo/core/api/auth';
import { assertHighway } from '@repo/core/api/highways';
import { identityAPI } from '@repo/core/api/identity';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from '@repo/core/api/supabase';
import type { SchoolType } from '@repo/core/constants/SriLankanSchools';
import { identifyUser } from '@repo/core/lib/monitoring/posthog';
import { clearSentryUser, initSentry, setSentryUser } from '@repo/core/lib/monitoring/sentry';
import { getSessionIdentityMode } from '@repo/core/logic/auth/identityState';
import { useAuthStore } from '@repo/core/store/useAuthStore';
import { useCedarDecisionStore } from '@repo/core/store/useCedarDecisionStore';
import { useStore } from '@repo/core/store/useStore';
import { APIError } from '@repo/core/types/API';
import type { Bond } from '@repo/core/types/Identity';
import { tryPromise } from '@repo/core/utils/effect';

/**
 * useAuthLifecycle (Native)
 *
 * Orchestrates the "Reactive Capability Sync" and session management.
 * Optimized for Mobile performance via siphoned identity resolution.
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

  const fetchAndSetUserProfile = useCallback(async () => {
    setIsProfileLoading(true);
    try {
      assertHighway('identity_bootstrap', 'direct-api');
      // 1. Resolve Sovereign Identity (Bonds & Perspectives)
      // [SOVEREIGN-SIPHON] unified into identifyActiveCitizen
      const identity = await identityAPI.identifyActiveCitizen();

      if (identity) {
        // 2. Update store
        // Cast simplified bonds to full Bond type - the store layer fills in additional fields
        setUser(identity as unknown as Parameters<typeof setUser>[0]);
        setAvailableBonds(identity.availableBonds as unknown as Bond[]);

        setPerspective({
          activeBond: identity.activeBond as unknown as Bond | undefined,
          availableBonds: identity.availableBonds as unknown as Bond[],
        });

        const isEffectivelyOnboarded = !!identity.onboarding_completed;
        if (isEffectivelyOnboarded) {
          setOnboardingCompleted(true);
        }

        if (identity.schoolId) {
          const { data: schoolData } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
            .from('schools')
            .select('type')
            .eq('id', identity.schoolId)
            .single();

          if (schoolData) {
            setSchoolType(schoolData.type as SchoolType | null);
          }
        } else {
          setSchoolType(null);
        }

        // Monitoring identification
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

        const sessionMode = getSessionIdentityMode(initialSession);
        if (sessionMode === 'authenticated' || sessionMode === 'guest') {
          await fetchAndSetUserProfile();
        } else if (initialSession?.user) {
          setUser(null);
          setPerspective(null);
          setAvailableBonds([]);
          setSchoolType(null);
          setOnboardingCompleted(false);
          useCedarDecisionStore.getState().clearDecisions();
          setActiveCapabilityToken(null);
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

    Effect.runFork(
      tryPromise(() => checkSession()).pipe(
        Effect.catchAll((e) => Effect.logError('Auth: Critical session check failed', e)),
      ),
    );

    // 3. Auth State Change Listener
    const {
      data: { subscription },
    } = __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setAuthSession(currentSession);
        setAuthSessionResolved(true);

        const currentMode = getSessionIdentityMode(currentSession);
        if (currentMode === 'authenticated' || currentMode === 'guest') {
          await fetchAndSetUserProfile();
        } else if (currentSession?.user) {
          setUser(null);
          setPerspective(null);
          setAvailableBonds([]);
          setSchoolType(null);
          setOnboardingCompleted(false);
          useCedarDecisionStore.getState().clearDecisions();
          setActiveCapabilityToken(null);
        } else if (event === 'SIGNED_OUT') {
          clearSentryUser();
          setUser(null);
          setPerspective(null);
          setAvailableBonds([]);
          setSchoolType(null);
          setOnboardingCompleted(false);
          useCedarDecisionStore.getState().clearDecisions();
          setActiveCapabilityToken(null);
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
        (payload) => {
          const handlePayload = async () => {
            // Detect privilege change
            const oldCapacity = useAuthStore.getState().activeBond?.capacity;
            const newCapacity = (payload.new as { capacity?: string })?.capacity;
            const capacityChanged = Boolean(newCapacity && newCapacity !== oldCapacity);

            if (capacityChanged) {
              try {
                await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__.auth.refreshSession();
              } catch (e) {
                console.error('Auth: JWT refresh failed after capacity change', e);
              }
            }

            Effect.runFork(
              tryPromise(() => refreshProfile()).pipe(
                Effect.catchAll((e) =>
                  Effect.logError('Auth: Profile refresh failed after remote update', e),
                ),
              ),
            );
          };
          Effect.runFork(
            tryPromise(() => handlePayload()).pipe(
              Effect.catchAll((e) => Effect.logError('Auth: handlePayload failed', e)),
            ),
          );
        },
      )
      .subscribe();

    return () => {
      Effect.runFork(
        tryPromise(() => __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__.removeChannel(channel)).pipe(
          Effect.catchAll((e) =>
            Effect.logError('Auth: Failed to remove channel during cleanup', e),
          ),
        ),
      );
    };
  }, [currentUser?.id, refreshProfile]);

  return useMemo(
    () => ({ session, loading, isProfileLoading, refreshProfile }),
    [session, loading, isProfileLoading, refreshProfile],
  );
}
