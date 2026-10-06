import { suggestDisplayName } from '@repo/core/logic';
import { useAuth } from '@repo/core/providers';
import { useStore } from '@repo/core/store';
import { CelebrationOverlay } from '@repo/ui/components/CelebrationOverlay';
import type { MascotArtworkSource } from '@repo/ui/components/Mascot';
import OnboardingScreen from '@repo/ui/screens/OnboardingScreen';
import { useCallback, useMemo, useState } from 'react';

export function OnboardingWrapper({
  onboardingArtwork,
}: {
  onboardingArtwork?: MascotArtworkSource;
}) {
  const { session, refreshProfile } = useAuth();
  const storeUser = useStore((state) => state.user);
  const showToast = useStore((state) => state.showToast);
  const [celebrate, setCelebrate] = useState(false);

  const suggestedName = useMemo(() => {
    return suggestDisplayName(session?.user ?? (storeUser as any));
  }, [session?.user, storeUser]);

  const handleComplete = useCallback(
    (_name: string, _capacity: any) => {
      void (async () => {
        try {
          const state = useStore.getState();
          const isAnonymous =
            storeUser?.is_anonymous === true || session?.user?.is_anonymous === true;
          if (isAnonymous) {
            // Local guest admission is persisted by onboardingAPI. Updating the
            // observable bootstrap input lets SessionRouteGate own the entry.
            state.setOnboardingCompleted(true);
          } else {
            showToast('Syncing your sanctuary profile...', 'info', 2000);
            await refreshProfile();
          }
          setCelebrate(true);
        } catch (err) {
          console.error('Failed to refresh profile after onboarding:', err);
          showToast(
            'Profile sync failed, but your progress is saved. Please restart the app if you are stuck.',
            'error',
          );
        }
      })();
    },
    [refreshProfile, session?.user?.is_anonymous, showToast, storeUser?.is_anonymous],
  );

  return (
    <>
      <OnboardingScreen
        userId={session?.user?.id}
        suggestedName={suggestedName}
        isAnonymous={storeUser?.is_anonymous === true || session?.user?.is_anonymous === true}
        onComplete={handleComplete}
        onboardingArtwork={onboardingArtwork}
      />
      <CelebrationOverlay
        trigger={celebrate}
        count={150}
        onAnimationEnd={() => setCelebrate(false)}
      />
    </>
  );
}
