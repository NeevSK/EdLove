import { type AuthorityTier, useAuth, useStore } from '@repo/core/logic';
import OnboardingScreen from './OnboardingScreen';

export function OnboardingWrapper() {
  const { session } = useAuth();
  const storeUser = useStore((state) => state.user);

  return (
    <OnboardingScreen
      isAnonymous={
        storeUser?.is_anonymous === true ||
        session?.user?.is_anonymous === true ||
        !session?.user?.email
      }
      onComplete={async (name: string, capacity: any) => {
        const store = useStore.getState();
        // Refresh the user profile to pick up the new Bond and onboarding status
        await (store as any).fetchUser();
      }}
    />
  );
}
