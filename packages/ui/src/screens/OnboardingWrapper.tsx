import { suggestDisplayName } from '@repo/core/logic';
import { useAuth } from '@repo/core/providers';
import { useStore } from '@repo/core/store';
import { discardLocalGuestSession } from '@repo/core/native';
import { CelebrationOverlay } from '@repo/ui/components/CelebrationOverlay';
import type { MascotArtworkSource } from '@repo/ui/components/Mascot';
import OnboardingScreen from '@repo/ui/screens/OnboardingScreen';
import { useCallback, useMemo, useState } from 'react';
import { Box, Pressable, Text } from '@repo/ui/primitives';

export function OnboardingWrapper({
  onboardingArtwork,
}: {
  onboardingArtwork?: MascotArtworkSource;
}) {
  const { session, refreshProfile } = useAuth();
  const storeUser = useStore((state) => state.user);
  const showToast = useStore((state) => state.showToast);
  const [celebrate, setCelebrate] = useState(false);
  const [isReconcilingAdmission, setIsReconcilingAdmission] = useState(false);
  const [admissionRecoveryError, setAdmissionRecoveryError] = useState<string | null>(null);

  const suggestedName = useMemo(() => {
    return suggestDisplayName(session?.user ?? (storeUser as any));
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
    const state = useStore.getState();
    const isAnonymous = storeUser?.is_anonymous === true || session?.user?.is_anonymous === true;
    if (isAnonymous) {
      // Local guest admission is persisted by onboardingAPI. Updating the
      // observable bootstrap input lets SessionRouteGate own the entry.
      state.setOnboardingCompleted(true);
      setCelebrate(true);
      return;
    }

    showToast('Syncing your sanctuary profile...', 'info', 2000);
    void reconcileAuthenticatedAdmission();
  }, [
    reconcileAuthenticatedAdmission,
    session?.user?.is_anonymous,
    showToast,
    storeUser?.is_anonymous,
  ]);

  const handleAbandon = useCallback(async () => {
    const userId = session?.user?.id;
    const isAnonymous = storeUser?.is_anonymous === true || session?.user?.is_anonymous === true;
    if (!isAnonymous || !userId) return;

    await discardLocalGuestSession(userId);
  }, [session?.user?.id, session?.user?.is_anonymous, storeUser?.is_anonymous]);

  return (
    <>
      <OnboardingScreen
        userId={session?.user?.id}
        suggestedName={suggestedName}
        isAnonymous={storeUser?.is_anonymous === true || session?.user?.is_anonymous === true}
        onComplete={handleComplete}
        onAbandon={handleAbandon}
        onboardingArtwork={onboardingArtwork}
      />
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
