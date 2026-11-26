import { getOrCreateLocalGuestSession } from '@repo/core/native/localGuestSession';
import { WorldLoading } from '@repo/ui/components/native';
import ErrorBoundary, { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { ObserveInteractiveMarker } from 'expo-observe';
import { Suspense, useCallback } from 'react';
import {
  useBootstrapSession,
  useRefreshLocalGuest,
} from '@/entry/BootstrapSessionProvider';
import { getFirstValueRoute } from '@/entry/firstValueRoute';
import { WelcomeScreen } from '@/screens/WelcomeScreen';
import { DevelopmentScreenInteractiveMarker } from '@/telemetry/DevelopmentScreenInteractiveMarker';
import { useNavigator } from '@repo/ui/components/native/navigation';

export { RouteErrorBoundary as ErrorBoundary };

function Fallback() {
  // The world's own waiting sign, on the floor (never a black screen between steps).
  return <WorldLoading label="Loading welcome" fullscreen />;
}

export default function WelcomeRoute() {
  const router = useNavigator();
  const routeState = useBootstrapSession();
  const refreshLocalGuest = useRefreshLocalGuest();

  const handleLogin = useCallback(() => {
    router.replace('/auth');
  }, [router]);

  const handleGuest = useCallback(() => {
    if (routeState.isLocalGuestReady) {
      router.replace(getFirstValueRoute(routeState.activeCapacity));
    } else {
      router.push('/onboarding?entry=guest');
    }
  }, [router, routeState.activeCapacity, routeState.isLocalGuestReady]);

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
    refreshLocalGuest();
    router.push('/onboarding?entry=guest');
  }, [handleGuest, refreshLocalGuest, routeState.hasLocalGuestSession, routeState.session, router]);

  return (
    <ErrorBoundary name="WelcomeRoute">
      <Suspense fallback={<Fallback />}>
        <WelcomeScreen onLogin={handleLogin} onStartGuest={handleStartGuest} />
        <DevelopmentScreenInteractiveMarker screen="welcome" />
        <ObserveInteractiveMarker params={{ entry_surface: 'welcome' }} />
      </Suspense>
    </ErrorBoundary>
  );
}
