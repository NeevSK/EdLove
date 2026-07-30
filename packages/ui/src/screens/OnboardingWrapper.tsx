import { useAuth } from '@repo/core/providers';
import { useStore } from '@repo/core/store';
import { useCallback } from 'react';
import OnboardingScreen from '@repo/ui/screens/OnboardingScreen';

export function OnboardingWrapper() {
  const { session, refreshProfile } = useAuth();
  const storeUser = useStore((state) => state.user);
  const showToast = useStore((state) => state.showToast);

  const handleComplete = useCallback(
    (_name: string, _capacity: any) => {
      void (async () => {
        try {
          showToast('Syncing your sanctuary profile...', 'info', 2000);
          await refreshProfile();

          const state = useStore.getState();
          if (!state.onboardingCompleted) {
            console.log('⚠️ [Onboarding] Store did not auto-update, forcing completion flag.');
            state.setOnboardingCompleted(true);
          }
        } catch (err) {
          console.error('Failed to refresh profile after onboarding:', err);
          showToast(
            'Profile sync failed, but your progress is saved. Please restart the app if you are stuck.',
            'error',
          );
        }
      })();
    },
    [refreshProfile, showToast],
  );

  return (
    <OnboardingScreen
      userId={session?.user?.id}
      isAnonymous={
        storeUser?.is_anonymous === true ||
        session?.user?.is_anonymous === true
      }
      onComplete={handleComplete}
    />
  );
}
