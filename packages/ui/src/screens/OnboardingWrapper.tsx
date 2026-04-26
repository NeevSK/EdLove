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
      onComplete={(name: string, role: AuthorityTier) => {
        const store = useStore.getState();
        if (name) store.setTeacherName(name);
        if (role) store.setUserRole(role);
        store.setOnboardingCompleted(true);
      }}
    />
  );
}
