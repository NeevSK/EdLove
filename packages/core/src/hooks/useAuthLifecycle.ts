import { captureAuthenticatedDeviceAccount } from '@repo/core/accounts/authenticatedAccountCapture';
import { deviceAccounts } from '@repo/core/accounts/deviceAccounts';
import { disconnectPowerSync } from '@repo/core/adapters/powersync/database';
import { authAPI } from '@repo/core/api/auth';
import { assertHighway } from '@repo/core/api/highways';
import { identityAPI } from '@repo/core/api/identity';
import { schoolAPI } from '@repo/core/api/school';
import type { SchoolType } from '@repo/core/constants/SriLankanSchools';
import { getActiveAccountId } from '@repo/core/lib/accountScope';
import { useExperienceState } from '@repo/core/lib/experienceState';
import { openReplayAdmission } from '@repo/core/lib/sync/replayAdmission';
import {
  getSessionIdentityMode,
  type IdentityAvailability,
  isCurrentAuthBootstrapGeneration,
  isCurrentIdentityResolutionGeneration,
} from '@repo/core/logic/auth/identityState';
import { resolveAuthProfile } from '@repo/core/logic/auth/profileResolution';
import { realtime } from '@repo/core/logic/managers/factory';
import type { AccountLifecycleStatus, AuthSession } from '@repo/core/logic/ports/auth.port';
import { clearAuthSubject, identifyAuthSubject, initSentry } from '@repo/core/monitoring';
import { useScopeSessionStore } from '@repo/core/store/scopeSession';
import {
  clearScopeSessionCompatibility,
  commitIdentityScopeSession,
} from '@repo/core/store/scopeSessionCoordinator';
import { useAuthStore } from '@repo/core/store/useAuthStore';
import { APIError } from '@repo/core/types/API';
import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

export { getVerifiedDeviceAccountProfile } from '@repo/core/accounts/authenticatedAccountCapture';

/** Throttle minimum interval for mobile AppState wake-up profile reconciliation. */
const APP_STATE_RECONCILE_THROTTLE_MS = 60_000;
const REMEMBERED_SESSION_ERROR = 'Unable to retain refreshed device credentials.';

/**
 * useAuthLifecycle
 *
 * Orchestrates the "Reactive Capability Sync" and session management.
 * Hardened for offline cold start, battery doze mode, and mobile token churn.
 */
export function useAuthLifecycle() {
  const [session, setSession] = useState<AuthSession | null>(null);
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

  const setUser = useAuthStore((state) => state.setUser);
  const setDemoMode = useExperienceState((state) => state.setDemoMode);

  const clearDerivedIdentityState = useCallback(() => {
    clearScopeSessionCompatibility();
    setUser(null);
    setIdentityAvailability('unknown');
    resolvedAuthSubjectIdRef.current = null;
    setResolvedAuthSubjectId(null);
    setAccountLifecycleStatus(null);
  }, [setAccountLifecycleStatus, setIdentityAvailability, setResolvedAuthSubjectId, setUser]);

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
    async (sessionToCapture?: AuthSession | null) => {
      // Only block the UI with a loading spinner on the very first boot fetch.
      // All subsequent fetches (tab focus, token refresh) run silently.
      const isFirstLoad = !hasBootstrappedRef.current;
      const resolutionGeneration = identityResolutionGenerationRef.current + 1;
      identityResolutionGenerationRef.current = resolutionGeneration;
      const isCurrentResolution = () =>
        isCurrentIdentityResolutionGeneration(
          resolutionGeneration,
          identityResolutionGenerationRef.current,
        );
      const authSubjectId = sessionToCapture?.user.id ?? null;
      const restoreVerifiedLocalIdentity = async (): Promise<boolean> => {
        const existingUser = useAuthStore.getState().user;
        const hasMatchingLocalUser = await hasVerifiedLocalIdentityForSubject(
          existingUser?.id,
          authSubjectId,
        );
        if (!isCurrentResolution()) return false;
        if (hasMatchingLocalUser) {
          setIdentityAvailability('active');
          resolvedAuthSubjectIdRef.current = authSubjectId;
          setResolvedAuthSubjectId(authSubjectId);
          if (existingUser && getActiveAccountId() === existingUser.id) {
            openReplayAdmission(existingUser.id);
          }
        } else {
          clearDerivedIdentityState();
        }
        return true;
      };
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
            try {
              const schoolData = await schoolAPI.getSchool(schoolId);
              return (schoolData?.type as SchoolType | undefined) ?? null;
            } catch {
              return null;
            }
          },
        });

        if (!isCurrentResolution()) return;

        if (resolution.kind === 'active') {
          const { identity, schoolType } = resolution;
          await commitIdentityScopeSession({
            principalId: identity.id,
            availableBonds: identity.availableBonds,
            selectedBond: identity.activeBond,
            schoolType,
          });
          if (!isCurrentResolution()) return;
          setIdentityAvailability('active');
          resolvedAuthSubjectIdRef.current = authSubjectId;
          setResolvedAuthSubjectId(authSubjectId);
          setAccountLifecycleStatus(null);
          setUser(identity);
          await captureAuthenticatedDeviceAccount({
            capturedSessionKeys: capturedSessionKeysRef.current,
            capturingSessionKeys: capturingSessionKeysRef.current,
            identity,
            resolvedAuthSubjectId: authSubjectId,
            session: sessionToCapture ?? null,
          });
          if (!isCurrentResolution()) return;

          if (getActiveAccountId() === identity.id) openReplayAdmission(identity.id);

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
          if (!(await restoreVerifiedLocalIdentity())) return;

          if (resolution.profileError) {
            setProfileError(resolution.profileError);
          }
        }
      } catch (error) {
        if (!isCurrentResolution()) return;
        console.warn('❌ Profile: Fetching encountered an error:', error);
        if (!(await restoreVerifiedLocalIdentity())) return;
        setProfileError(error instanceof Error ? error.message : 'Unable to restore your profile.');
      } finally {
        if (isCurrentResolution()) {
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
    [clearDerivedIdentityState, hasVerifiedLocalIdentityForSubject, setUser],
  );

  const refreshProfile = useCallback(async () => {
    const generation = authEventGenerationRef.current;
    const currentSession = await authAPI.getAuthSession();
    if (!isCurrentAuthBootstrapGeneration(generation, authEventGenerationRef.current)) return;
    await fetchAndSetUserProfile(currentSession);
  }, [fetchAndSetUserProfile]);

  const retainRefreshedDeviceSession = useCallback(
    async (current: AuthSession | null, generation: number) => {
      try {
        const retained = await deviceAccounts.retainRefreshedSession(current);
        if (!isCurrentAuthBootstrapGeneration(generation, authEventGenerationRef.current)) return;
        if (retained) {
          setProfileError((error) => (error === REMEMBERED_SESSION_ERROR ? null : error));
        } else {
          await fetchAndSetUserProfile(current);
        }
      } catch {
        if (!isCurrentAuthBootstrapGeneration(generation, authEventGenerationRef.current)) return;
        setProfileError(REMEMBERED_SESSION_ERROR);
        console.warn('[auth] Refreshed device credential retention failed.');
      }
    },
    [fetchAndSetUserProfile],
  );

  const handleAppStateChange = useEffectEvent((nextState: AppStateStatus) => {
    if (nextState !== 'active' || getSessionIdentityMode(session) !== 'authenticated') return;
    const now = Date.now();
    if (now - lastReconciledAtRef.current < APP_STATE_RECONCILE_THROTTLE_MS) return;
    lastReconciledAtRef.current = now;
    refreshProfile().catch((error) => {
      console.warn('Auth: Background AppState profile refresh failed', error);
    });
  });

  useEffect(() => {
    // 1. Initialize error monitoring. Product analytics is initialized by the
    // application shell so there is only one provider/transport instance.
    initSentry();

    // 2. Initial Session Check
    const checkSession = async () => {
      const bootstrapGeneration = authEventGenerationRef.current;
      try {
        const initialSession = await authAPI.getAuthSession();
        if (
          !isCurrentAuthBootstrapGeneration(bootstrapGeneration, authEventGenerationRef.current)
        ) {
          return;
        }
        const initialSubjectId = initialSession?.user?.id ?? null;
        const persistedScopePrincipalId =
          useScopeSessionStore.getState().snapshot?.principalId ??
          useAuthStore.getState().user?.id ??
          null;
        if (persistedScopePrincipalId) {
          const hasMatchingOwner = await hasVerifiedLocalIdentityForSubject(
            persistedScopePrincipalId,
            initialSubjectId,
          );
          if (
            !isCurrentAuthBootstrapGeneration(bootstrapGeneration, authEventGenerationRef.current)
          ) {
            return;
          }
          if (!hasMatchingOwner) clearDerivedIdentityState();
        }
        setSession(initialSession);
        previousUserIdRef.current = initialSubjectId;

        const sessionMode = getSessionIdentityMode(initialSession);
        if (sessionMode === 'authenticated') {
          await fetchAndSetUserProfile(initialSession);
        } else if (initialSession?.user) {
          clearDerivedIdentityState();
        }
      } catch (error) {
        if (!isCurrentAuthBootstrapGeneration(bootstrapGeneration, authEventGenerationRef.current))
          return;
        if (error instanceof APIError) {
          if (
            error.message?.includes('Refresh Token') ||
            (error as { status?: number }).status === 400
          ) {
            await authAPI.signOut({ scope: 'local' });
            if (
              !isCurrentAuthBootstrapGeneration(bootstrapGeneration, authEventGenerationRef.current)
            )
              return;
            setSession(null);
          }
        }
      } finally {
        if (isCurrentAuthBootstrapGeneration(bootstrapGeneration, authEventGenerationRef.current)) {
          setLoading(false);
        }
      }
    };

    // 3. Register before reading the initial session. The session request crosses
    // an asynchronous boundary, so subscribing first prevents a sign-in/out event
    // from being lost while the initial request is in flight.
    const {
      data: { subscription },
    } = authAPI.onAuthStateChange(async (event, currentSession) => {
      authEventGenerationRef.current += 1;
      setSession(currentSession);
      setLoading(false);

      const currentUserId = currentSession?.user?.id ?? null;
      const isSubjectChanged = currentUserId !== previousUserIdRef.current;
      const isTokenOnlyRefresh =
        event === 'TOKEN_REFRESHED' &&
        currentUserId !== null &&
        currentUserId === previousUserIdRef.current;

      previousUserIdRef.current = currentUserId;
      const currentMode = getSessionIdentityMode(currentSession);
      if (isSubjectChanged || currentMode !== 'authenticated') {
        identityResolutionGenerationRef.current += 1;
        setIsProfileResolving(false);
        setIsProfileLoading(false);
        setProfileError(null);
      }

      if (isSubjectChanged) {
        clearDerivedIdentityState();
      }

      if (isTokenOnlyRefresh && currentMode === 'authenticated') {
        await retainRefreshedDeviceSession(currentSession, authEventGenerationRef.current);
        return;
      }

      if (currentMode === 'authenticated') {
        await fetchAndSetUserProfile(currentSession);
      } else if (currentSession?.user) {
        clearDerivedIdentityState();
      } else if (event === 'SIGNED_OUT') {
        clearAuthSubject();
        clearDerivedIdentityState();
        setDemoMode(false);
      } else if (currentSession) {
        setDemoMode(false);
      }
    });

    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    checkSession().catch((e) => {
      console.error('Auth: Critical session check failed', e);
    });

    return () => {
      authEventGenerationRef.current += 1;
      identityResolutionGenerationRef.current += 1;
      subscription.unsubscribe();
      appStateSubscription.remove();
    };
  }, [
    clearDerivedIdentityState,
    fetchAndSetUserProfile,
    hasVerifiedLocalIdentityForSubject,
    retainRefreshedDeviceSession,
    refreshProfile,
    setDemoMode,
    setUser,
  ]);

  // 4. Realtime Profile Updates (Capability Sync)
  const currentUser = useAuthStore((state) => state.user);
  useEffect(() => {
    if (!currentUser?.id || getSessionIdentityMode(session) !== 'authenticated') return;

    const subscription = realtime.subscribe(
      `user-profile-sync-${currentUser.id}`,
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
    );

    return () => {
      subscription.unsubscribe().catch((e: unknown) => {
        console.error('Auth: Failed to remove channel during cleanup', e);
      });
    };
  }, [currentUser?.id, refreshProfile, session]);

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
