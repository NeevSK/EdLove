import { showToast } from '@repo/core/lib/feedback';
import { getOrCreateLocalGuestSession } from '@repo/core/native/localGuestSession';
import { useAuthStore } from '@repo/core/store/useAuthStore';
import { BrandPulse } from '@repo/ui';
import ErrorBoundary, { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { Center } from '@repo/ui/primitives';
import {
  SanctuaryWelcomeScreen,
  SpatialSanctuaryWelcomeScreen,
  WelcomeScreen,
} from '@repo/ui/screens';
import { ObserveInteractiveMarker } from 'expo-observe';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Suspense, useCallback } from 'react';
import { Platform } from 'react-native';
import { fireflyPrototypeArtwork } from '@/brand/mascotArtwork';
import { useBootstrapRouteState } from '@/entry/bootstrapRouteState';
import { DevelopmentScreenInteractiveMarker } from '@/telemetry/DevelopmentScreenInteractiveMarker';

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
    router.replace('/auth');
  }, [router]);

  const handleScanQR = useCallback(() => {
    router.push('/qr');
  }, [router]);

  const handleGuest = useCallback(() => {
    if (routeState.isLocalGuestReady) {
      router.replace('/self');
    } else {
      router.replace('/onboarding?entry=guest');
    }
  }, [router, routeState.isLocalGuestReady]);

  const handleStartGuest = useCallback(async () => {
    if (routeState.session?.user && routeState.session.user.is_anonymous !== true) {
      router.replace('/');
      return;
    }
    if (routeState.hasLocalGuestSession) {
      handleGuest();
      return;
    }

    await getOrCreateLocalGuestSession();
    showToast(
      'Your progress is saved on this device. Create an account when you want to sync it.',
      'info',
      5000,
    );
    router.replace('/onboarding?entry=guest');
  }, [handleGuest, routeState.hasLocalGuestSession, routeState.session?.user, router, showToast]);

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
            onStartGuest={handleStartGuest}
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
            onStartGuest={handleStartGuest}
            onScanQR={handleScanQR}
          />
        )}
        <DevelopmentScreenInteractiveMarker screen="welcome" />
        <ObserveInteractiveMarker params={{ entry_surface: 'welcome' }} />
      </Suspense>
    </ErrorBoundary>
  );
}
