import { BrandPulse } from '@repo/ui';
import ErrorBoundary, { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { Center } from '@repo/ui/primitives';
import { SanctuaryWelcomeScreen, WelcomeScreen } from '@repo/ui/screens';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Suspense, useCallback } from 'react';
import { fireflyProductArtwork } from '@/brand/mascotArtwork';

export { RouteErrorBoundary as ErrorBoundary };

function Fallback() {
  return (
    <Center className="flex-1 bg-obsidian">
      <BrandPulse accessibilityLabel="Loading welcome" />
    </Center>
  );
}

export default function WelcomeRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{ legacy?: string }>();

  const handleLogin = useCallback(() => {
    router.push('/auth');
  }, [router]);

  const handleGuest = useCallback(() => {
    router.push('/onboarding');
  }, [router]);

  return (
    <ErrorBoundary name="WelcomeRoute">
      <Suspense fallback={<Fallback />}>
        {params.legacy === '1' ? (
          <WelcomeScreen
            exploreArtwork={fireflyProductArtwork.explore}
            onLogin={handleLogin}
            onGuest={handleGuest}
          />
        ) : (
          <SanctuaryWelcomeScreen
            exploreArtwork={fireflyProductArtwork.explore}
            onLogin={handleLogin}
            onGuest={handleGuest}
          />
        )}
      </Suspense>
    </ErrorBoundary>
  );
}
