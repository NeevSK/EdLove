import { BrandPulse } from '@repo/ui';
import ErrorBoundary, { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { Center } from '@repo/ui/primitives';
import {
  SanctuaryWelcomeScreen,
  SpatialSanctuaryWelcomeScreen,
  WelcomeScreen,
} from '@repo/ui/screens';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ObserveInteractiveMarker } from 'expo-observe';
import { Suspense, useCallback } from 'react';
import { Platform } from 'react-native';
import { fireflyPrototypeArtwork } from '@/brand/mascotArtwork';
import { useBootstrapRouteState } from '@/entry/bootstrapRouteState';

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
  const params = useLocalSearchParams<{ legacy?: string; mode?: string }>();
  const routeState = useBootstrapRouteState('/welcome');

  const handleLogin = useCallback(() => {
    router.push('/auth');
  }, [router]);

  const handleGuest = useCallback(() => {
    if (routeState.isLocalGuestReady) {
      router.replace('/self');
    } else {
      router.push('/onboarding?entry=guest');
    }
  }, [router, routeState.isLocalGuestReady]);

  // On Web by default (or when mode=spatial is requested), render the new decoupled SpatialSanctuaryWelcomeScreen
  const useSpatialWeb = Platform.OS === 'web' && params.legacy !== '1';

  return (
    <ErrorBoundary name="WelcomeRoute">
      <Suspense fallback={<Fallback />}>
        {params.legacy === '1' ? (
          <WelcomeScreen
            exploreArtwork={fireflyPrototypeArtwork}
            onLogin={handleLogin}
            onGuest={handleGuest}
          />
        ) : useSpatialWeb ? (
          <SpatialSanctuaryWelcomeScreen
            exploreArtwork={fireflyPrototypeArtwork}
            onLogin={handleLogin}
            onGuest={handleGuest}
          />
        ) : (
          <SanctuaryWelcomeScreen
            exploreArtwork={fireflyPrototypeArtwork}
            onLogin={handleLogin}
            onGuest={handleGuest}
          />
        )}
        <ObserveInteractiveMarker params={{ entry_surface: 'welcome' }} />
      </Suspense>
    </ErrorBoundary>
  );
}
