import { showToast } from '@repo/core/lib/feedback';
import { suggestDisplayName } from '@repo/core/logic';
import { discardLocalGuestSession } from '@repo/core/native';
import { discardLocalGuestOnboarding } from '@repo/core/native/localGuestOnboarding';
import {
  type LocalGuestSession,
  restoreLocalGuestSession,
} from '@repo/core/native/localGuestSession';
import { useAuth } from '@repo/core/providers';
import { useAuthStore } from '@repo/core/store/useAuthStore';

import { CelebrationOverlay } from '@repo/ui/components/CelebrationOverlay';
import type { MascotArtworkSource } from '@repo/ui/components/Mascot';
import { Box, Pressable, Text } from '@repo/ui/primitives';
import OnboardingScreen from '@repo/ui/screens/OnboardingScreen';
import { useCallback, useEffect, useMemo, useState } from 'react';

export function OnboardingWrapper({
  onboardingArtwork,
}: {
  onboardingArtwork?: MascotArtworkSource;
}) {
  const { session, refreshProfile } = useAuth();
  const storeUser = useAuthStore((state) => state.user);

  const [celebrate, setCelebrate] = useState(false);
  const [isReconcilingAdmission, setIsReconcilingAdmission] = useState(false);
  const [admissionRecoveryError, setAdmissionRecoveryError] = useState<string | null>(null);
  const [localGuestId, setLocalGuestId] = useState<string | null>(null);
  const [localGuestRestoreError, setLocalGuestRestoreError] = useState<string | null>(null);
  const [localGuestRestoreAttempt, setLocalGuestRestoreAttempt] = useState(0);

  useEffect(() => {
    if (session?.user) {
      setLocalGuestId(null);
      setLocalGuestRestoreError(null);
      return;
    }

    let active = true;
    setLocalGuestRestoreError(null);
    void restoreLocalGuestSession()
      .then((localGuest: LocalGuestSession | null) => {
        if (active) setLocalGuestId(localGuest?.id ?? null);
      })
      .catch((error: unknown) => {
        console.warn('[onboarding] unable to restore local guest session:', error);
        if (!active) return;
        setLocalGuestId(null);
        setLocalGuestRestoreError('We could not open your offline guest session yet.');
      });
    return () => {
      active = false;
    };
  }, [localGuestRestoreAttempt, session?.user]);

  const suggestedName = useMemo(() => {
    return suggestDisplayName(session?.user ?? storeUser);
  }, [session?.user, storeUser]);

  const reconcileAuthenticatedAdmission = useCallback(async () => {
    setIsReconcilingAdmission(true);
    setAdmissionRecoveryError(null);
    try {
      await refreshProfile();
      setCelebrate(true);
    } catch (error: unknown) {
      console.error('Failed to reconcile profile after onboarding:', error);
      setAdmissionRecoveryError(
        'Your setup was saved, but we could not restore your sanctuary admission yet.',
      );
      showToast('Your setup is saved. Reconnect when you are ready to enter.', 'error', 5000);
    } finally {
      setIsReconcilingAdmission(false);
    }
  }, [refreshProfile, showToast]);

  const handleComplete = useCallback(() => {
    const state = useAuthStore.getState();
    const isGuest =
      Boolean(localGuestId) ||
      storeUser?.is_anonymous === true ||
      session?.user?.is_anonymous === true;
    if (isGuest) {
      // Guest admission is persisted by its local or anonymous onboarding path.
      // Updating the observable bootstrap input lets SessionRouteGate own entry.
      if (state.user) state.setUser({ ...state.user, onboarding_completed: true });
      setCelebrate(true);
      return;
    }

    showToast('Syncing your sanctuary profile...', 'info', 2000);
    void reconcileAuthenticatedAdmission();
  }, [
    reconcileAuthenticatedAdmission,
    localGuestId,
    session?.user?.is_anonymous,
    showToast,
    storeUser?.is_anonymous,
  ]);

  const handleAbandon = useCallback(async () => {
    const userId = session?.user?.id;
    const isAnonymous = storeUser?.is_anonymous === true || session?.user?.is_anonymous === true;
    if (localGuestId) {
      await discardLocalGuestOnboarding(localGuestId);
      return;
    }
    if (!isAnonymous || !userId) return;

    await discardLocalGuestSession(userId);
  }, [localGuestId, session?.user?.id, session?.user?.is_anonymous, storeUser?.is_anonymous]);

  return (
    <>
      {localGuestRestoreError ? (
        <Box
          accessibilityRole="alert"
          className="flex-1 items-center justify-center bg-phase-canvas px-8"
        >
          <Text className="text-center text-xl font-bold text-phase-text-primary">
            Offline guest session paused
          </Text>
          <Text className="mt-3 text-center text-sm text-phase-text-secondary">
            {localGuestRestoreError}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Retry offline guest session"
            className="mt-6 w-full max-w-xs items-center rounded-xl bg-phase-interactive px-6 py-3.5 active:opacity-90"
            onPress={() => setLocalGuestRestoreAttempt((attempt) => attempt + 1)}
          >
            <Text className="font-semibold text-white">Try again</Text>
          </Pressable>
        </Box>
      ) : (
        <OnboardingScreen
          userId={session?.user?.id ?? localGuestId}
          suggestedName={suggestedName}
          isAnonymous={storeUser?.is_anonymous === true || session?.user?.is_anonymous === true}
          isLocalGuest={Boolean(localGuestId)}
          onComplete={handleComplete}
          onAbandon={handleAbandon}
          onboardingArtwork={onboardingArtwork}
        />
      )}
      <CelebrationOverlay
        trigger={celebrate}
        count={150}
        onAnimationEnd={() => setCelebrate(false)}
      />
      {admissionRecoveryError ? (
        <Box
          accessibilityRole="alert"
          className="absolute inset-0 items-center justify-center bg-phase-canvas/95 px-8"
        >
          <Text className="text-center text-xl font-bold text-phase-text-primary">
            Your sanctuary is ready
          </Text>
          <Text className="mt-3 text-center text-sm text-phase-text-secondary">
            {admissionRecoveryError}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Retry sanctuary admission"
            accessibilityState={{ disabled: isReconcilingAdmission }}
            className="mt-6 w-full max-w-xs items-center rounded-xl bg-phase-interactive px-6 py-3.5 active:opacity-90"
            disabled={isReconcilingAdmission}
            onPress={() => void reconcileAuthenticatedAdmission()}
          >
            <Text className="font-semibold text-white">
              {isReconcilingAdmission ? 'Reconnecting…' : 'Reconnect sanctuary'}
            </Text>
          </Pressable>
        </Box>
      ) : null}
    </>
  );
}
