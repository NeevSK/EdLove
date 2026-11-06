import { getOrCreateLocalGuestSession } from '@repo/core/native/localGuestSession';
import { BrandPulse } from '@repo/ui';
import ErrorBoundary, { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { SanctuaryWelcomeScreen } from '@repo/ui/screens';
import { ObserveInteractiveMarker } from 'expo-observe';
import { useRouter } from 'expo-router';
import { Suspense, useCallback } from 'react';
import { Platform, View } from 'react-native';
import { fireflyPrototypeArtwork } from '@/brand/mascotArtwork';
import { useBootstrapRouteState } from '@/entry/bootstrapRouteState';
import { DevelopmentScreenInteractiveMarker } from '@/telemetry/DevelopmentScreenInteractiveMarker';

export { RouteErrorBoundary as ErrorBoundary };

function Fallback() {
  return (
    <View className="flex-1 items-center justify-center bg-obsidian">
      <BrandPulse accessibilityLabel="Loading welcome" />
    </View>
  );
}

export default function WelcomeRoute() {
  const router = useRouter();
  const routeState = useBootstrapRouteState('/welcome');

  const handleLogin = useCallback(() => {
    router.replace('/auth');
  }, [router]);

  const handleGuest = useCallback(() => {
    if (routeState.isLocalGuestReady) {
      router.replace('/self');
    } else {
      router.push('/onboarding?entry=guest');
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
    // A guest is device-local: no server account exists until they sign in.
    await getOrCreateLocalGuestSession();
    router.push('/onboarding?entry=guest');
  }, [handleGuest, routeState.hasLocalGuestSession, routeState.session?.user, router]);

  return (
    <ErrorBoundary name="WelcomeRoute">
      <Suspense fallback={<Fallback />}>
        <SanctuaryWelcomeScreen
          exploreArtwork={fireflyPrototypeArtwork}
          onLogin={handleLogin}
          onGuest={handleGuest}
          onStartGuest={handleStartGuest}
        />
        <DevelopmentScreenInteractiveMarker screen="welcome" />
        <ObserveInteractiveMarker params={{ entry_surface: 'welcome' }} />
      </Suspense>
    </ErrorBoundary>
  );
}
