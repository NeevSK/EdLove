import type { Session } from '@supabase/supabase-js';
import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { authAPI } from '../api/auth';
import { identityAPI } from '../api/identity';
import { APIError } from '../api/types';
import type { SchoolType } from '../constants/SriLankanSchools';
import { identifyUser, initPostHog, trackEvent } from '../lib/monitoring/posthog';
import { clearSentryUser, initSentry, setSentryUser } from '../lib/monitoring/sentry';
import { supabase } from '../lib/supabase';
import type { Role } from '../permissions/schemas/role.schema';
import { useStore } from '../store/useStore';
import type { User } from '../types';

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
  const setUserRole = useStore((state) => state.setUserRole);
  const setSchoolType = useStore((state) => state.setSchoolType);
  const setOnboardingCompleted = useStore((state) => state.setOnboardingCompleted);
  const setAuthSession = useStore((state) => state.setAuthSession);
  const setAuthSessionResolved = useStore((state) => state.setAuthSessionResolved);

  const fetchAndSetUserProfile = useCallback(
    async (internalUserId: string) => {
      setIsProfileLoading(true);
      try {
        const { data: userProfile, error } = await supabase
          .from('users')
          .select(
            'id, role, school_id, onboarding_completed, full_name, email, avatar_url, is_anonymous, profile_completed',
          )
          .eq('id', internalUserId)
          .maybeSingle();

        if (error) {
          console.warn('\u26A0\uFE0F Profile: Table fetch returned error:', error.message);
          return;
        }

        if (userProfile) {
          const normalizedRole = (
            userProfile.role === 'guest' ? null : userProfile.role
          ) as Role | null;

          // Update store
          setUser({ ...userProfile, role: normalizedRole } as unknown as User);
          setUserRole(normalizedRole);

          const isEffectivelyOnboarded = !!userProfile.onboarding_completed && !!normalizedRole;
          if (isEffectivelyOnboarded) {
            setOnboardingCompleted(true);
          }

          if (userProfile.school_id) {
            const { data: schoolData } = await supabase
              .from('schools')
              .select('type')
              .eq('id', userProfile.school_id)
              .single();

            if (schoolData) {
              setSchoolType(schoolData.type as SchoolType | null);
            }
          } else {
            setSchoolType(null);
          }

          // Monitoring identification
          setSentryUser({
            id: userProfile.id,
            email: userProfile.email,
            username: userProfile.full_name,
          });

          identifyUser(userProfile.id, {
            email: userProfile.email,
            full_name: userProfile.full_name,
            role: normalizedRole,
            school_id: userProfile.school_id,
          });
        }
      } catch (error) {
        console.warn('\u274C Profile: Fetching encountered an error:', error);
      } finally {
        setIsProfileLoading(false);
      }
    },
    [setUser, setUserRole, setSchoolType, setOnboardingCompleted],
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
    initPostHog().then(() => {
      trackEvent('app_initialized', { platform: Platform.OS });
    });

    // 2. Initial Session Check
    const checkSession = async () => {
      try {
        const initialSession = await authAPI.getSession();
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
            await supabase.auth.signOut({ scope: 'local' });
            setSession(null);
            setAuthSession(null);
          }
        }
      } finally {
        setLoading(false);
        setAuthSessionResolved(true);
      }
    };

    checkSession();

    // 3. Auth State Change Listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
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
        setUserRole(null);
        setSchoolType(null);
        setOnboardingCompleted(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [
    setAuthSession,
    setAuthSessionResolved,
    setUser,
    setUserRole,
    setSchoolType,
    setOnboardingCompleted,
    fetchAndSetUserProfile,
  ]);

  // 4. Realtime Profile Updates (Capability Sync)
  const currentUser = useStore((state) => state.user);
  useEffect(() => {
    if (!currentUser?.id) return;

    if (__DEV__) {
      console.log('\uD83C\uDF38 Auth: Subscribing to profile changes for:', currentUser.id);
    }

    const channel = supabase
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
          if (__DEV__) {
            console.log('\uD83C\uDF38 Auth: Profile update received:', payload.new);
          }
          // Force a profile refresh on remote change
          refreshProfile();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser?.id, fetchAndSetUserProfile]);

  return { session, loading, isProfileLoading, refreshProfile };
}
