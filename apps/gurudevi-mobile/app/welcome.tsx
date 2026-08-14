import { BrandPulse } from '@repo/ui';
import { Center } from '@repo/ui/primitives';
import WelcomeScreen from '@repo/ui/screens/WelcomeScreen';
import { useRouter } from 'expo-router';
import { Suspense, useCallback } from 'react';

function Fallback() {
  return (
    <Center className="flex-1 bg-obsidian">
      <BrandPulse accessibilityLabel="Loading welcome" />
    </Center>
  );
}

export default function WelcomeRoute() {
  const router = useRouter();

  const handleLogin = useCallback(() => {
    router.push('/auth');
  }, [router]);

  const handleGuest = useCallback(() => {
    router.push('/onboarding');
  }, [router]);

  return (
    <Suspense fallback={<Fallback />}>
      <WelcomeScreen onLogin={handleLogin} onGuest={handleGuest} />
    </Suspense>
  );
}
