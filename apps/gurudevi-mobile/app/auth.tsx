import { identityAPI } from '@repo/core/api/identity';
import { BrandPulse } from '@repo/ui';
import { Center } from '@repo/ui/primitives';
import { safeBack } from '@repo/ui/utils/navigation';
import { useRouter } from 'expo-router';
import { Suspense, useCallback } from 'react';
import AuthScreen from '../src/screens/AuthScreen';

function Fallback() {
  return (
    <Center className="flex-1 bg-obsidian">
      <BrandPulse accessibilityLabel="Loading sign in" />
    </Center>
  );
}

export default function AuthRoute() {
  const router = useRouter();

  const handleSuccess = useCallback(async () => {
    try {
      const citizen = await identityAPI.identifyActiveCitizen();
      if (citizen?.onboarding_completed) {
        router.replace('/self');
        return;
      }
    } catch (error) {
      console.warn('[auth route] unable to resolve onboarding completion after login', error);
    }

    router.replace('/onboarding');
  }, [router]);

  const handleBack = useCallback(() => {
    safeBack('/welcome');
  }, []);

  return (
    <Suspense fallback={<Fallback />}>
      <AuthScreen onSuccess={handleSuccess} onBack={handleBack} />
    </Suspense>
  );
}
