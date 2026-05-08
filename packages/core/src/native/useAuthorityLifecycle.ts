import type { Session } from '@supabase/supabase-js';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import { authAPI } from '../api/auth';
import { identityAPI } from '../api/identity';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from '../api/supabase';
import type { SchoolType } from '../constants/SriLankanSchools';
import { identifyUser, initPostHog, trackEvent } from '../lib/monitoring/posthog';
import { clearSentryUser, initSentry, setSentryUser } from '../lib/monitoring/sentry';
import { useAuthStore } from '../store/useAuthStore';
import { useStore } from '../store/useStore';
import type { User } from '../types';
import { APIError } from '../types/API';

/**
 * useAuthorityLifecycle
 *
 * Orchestrates the "Reactive Capability Sync" and session management.
 * This is the heart of the POA system's reactivity.
 */
export function useAuthorityLifecycle() {
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

  const fetchAndSetUserProfile = useCallback(
    async (internalUserId: string) => {
      setIsProfileLoading(true);
      try {
        // 1. Resolve Sovereign Identity (Bonds & Perspectives)
        const [profile, bonds, perspective] = await Promise.all([
          identityAPI.getProfile(internalUserId),
          identityAPI.getClassroomRoleSummary(internalUserId), // This handles bonds
          identityAPI.getOnboardingStatus(internalUserId), // This handles perspective/state
        ]);

        if (profile) {
          // 2. Update store
          setUser(profile as any);
          // Note: Perspective resolution might need a more direct call if classroom summary isn't enough
          
          const isEffectivelyOnboarded = !!profile.onboarding_completed;
          if (isEffectivelyOnboarded) {
            setOnboardingCompleted(true);
          }

          if (profile.school_id) {
            const { data: schoolData } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
              .from('schools')
              .select('type')
              .eq('id', profile.school_id)
              .single();

            if (schoolData) {
              setSchoolType(schoolData.type as SchoolType | null);
            }
          } else {
            setSchoolType(null);
          }

          // Monitoring identification
          setSentryUser({
            id: profile.id,
            email: profile.email,
            username: profile.full_name,
          });

          identifyUser(profile.id, {
            email: profile.email,
            full_name: profile.full_name,
            capacity: bonds.profile.active_bond?.capacity || null,
            school_id: profile.school_id,
          });
        }
      } catch (error) {
        console.warn('\u274C Profile: Fetching encountered an error:', error);
      } finally {
        setIsProfileLoading(false);
      }
    },
    [setUser, setPerspective, setAvailableBonds, setSchoolType, setOnboardingCompleted],
  );

  const refreshProfile = useCallback(async () => {
    const internalId = await identityAPI.getMyInternalId();
    if (internalId) {
      await fetchAndSetUserProfile(internalId);
    }
  }, [fetchAndSetUserProfile]);

  useEffect(() => {
    // 1. Initialize Monitoring
    initSentry();
    initPostHog()
      .then(() => {
        trackEvent('app_initialized', { platform: Platform.OS });
      })
      .catch((e) => {
        console.error('Monitoring: PostHog initialization failed', e);
      });

    // 2. Initial Session Check
    const checkSession = async () => {
      try {
        const initialSession = await authAPI.getAuthSession();
        setSession(initialSession);
        setAuthSession(initialSession);

        if (initialSession?.user) {
          const internalId = await identityAPI.getMyInternalId();
          if (internalId) {
            await fetchAndSetUserProfile(internalId);
          }
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
    } = __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);
      setAuthSession(currentSession);
      setAuthSessionResolved(true);

      if (currentSession?.user) {
        const internalId = await identityAPI.getMyInternalId();
        if (internalId) {
          await fetchAndSetUserProfile(internalId);
        }
      } else if (event === 'SIGNED_OUT') {
        clearSentryUser();
        identityAPI.clearCache();
        setUser(null);
        setPerspective(null);
        setAvailableBonds([]);
        setSchoolType(null);
        setOnboardingCompleted(false);
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
    fetchAndSetUserProfile,
  ]);

  // 4. Realtime Profile Updates (Capability Sync) — 2026 JWT-Aware Pattern
  //
  //  CRITICAL FIX: When a user's capacity changes (e.g., promoted to 'principal'),
  //  Supabase Realtime pushes the new row immediately. BUT the Supabase JWT still
  //  has the OLD claims until explicitly refreshed.
  //  If we only update Zustand, the UI shows 'Principal' but API calls carry a
  //  'teacher' JWT and Supabase RLS rejects them.
  //
  //  Fix: detect capacity delta → refreshSession() FIRST → then refreshProfile().
  const currentUser = useStore((state) => state.user);
  useEffect(() => {
    if (!currentUser?.id) return;

    if (__DEV__) {
      console.log('\uD83C\uDF38 Auth: Subscribing to profile changes for:', currentUser.id);
    }

    const channel = __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .channel(`user-profile-sync-${currentUser.id}-${Math.random().toString(36).slice(2, 9)}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${currentUser.id}`,
        },
        async (payload) => {
          if (__DEV__) {
            console.log('\uD83C\uDF38 Auth: Profile update received:', payload.new);
          }

          // Detect privilege change
          // NOTE: capacity lives on the Bond, not the User record.
          // Read the current active capacity from the auth store's activeBond.
          const oldCapacity = useAuthStore.getState().active_bond?.capacity;
          const newCapacity = (payload.new as { capacity?: string })?.capacity;
          const capacityChanged = Boolean(newCapacity && newCapacity !== oldCapacity);

          if (capacityChanged) {
            if (__DEV__) {
              console.log(`\uD83D\uDD11 Auth: Capacity changed ${oldCapacity} -> ${newCapacity}. Refreshing JWT...`);
            }
            // Force a new JWT with updated custom claims so that
            // RLS-dependent API calls inside refreshProfile() succeed.
            try {
              await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__.auth.refreshSession();
            } catch (e) {
              console.error('Auth: JWT refresh failed after capacity change', e);
            }
          }

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
