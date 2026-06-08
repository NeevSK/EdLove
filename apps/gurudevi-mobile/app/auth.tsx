import { Center, Spinner } from '@repo/ui/primitives';
import { useRouter } from 'expo-router';
import { Suspense, useCallback } from 'react';
import AuthScreen from '../src/screens/AuthScreen';

function Fallback() {
  return (
    <Center className="flex-1 bg-obsidian">
      <Spinner />
    </Center>
  );
}

export default function AuthRoute() {
  const router = useRouter();

  const handleSuccess = useCallback(() => {
    router.replace('/onboarding');
  }, [router]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <Suspense fallback={<Fallback />}>
      <AuthScreen onSuccess={handleSuccess} onBack={handleBack} />
    </Suspense>
  );
}
