import { useAuth, useStore } from '@repo/core/logic';
import { Center, Spinner } from '@repo/ui/primitives';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function IndexRoute() {
  const router = useRouter();
  const { session, loading, isProfileLoading } = useAuth();
  const onboardingCompleted = useStore((state) => state.onboardingCompleted);

  useEffect(() => {
    if (loading || isProfileLoading) return;

    if (!session) {
      router.replace('/welcome');
      return;
    }

    if (!onboardingCompleted) {
      router.replace('/onboarding');
      return;
    }

    router.replace('/main');
  }, [isProfileLoading, loading, onboardingCompleted, router, session]);

  return (
    <Center className="flex-1 bg-obsidian">
      <Spinner />
    </Center>
  );
}
