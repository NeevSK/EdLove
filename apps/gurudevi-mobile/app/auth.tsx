import { WorldLoading } from '@repo/ui/components/native';
import ErrorBoundary, { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { Suspense, useCallback } from 'react';
import AuthScreen from '../src/screens/AuthScreen';
import { useNavigator } from '@repo/ui/components/native/navigation';

export { RouteErrorBoundary as ErrorBoundary };

function Fallback() {
  // The world's own waiting sign, on the floor (never a black screen between steps).
  return <WorldLoading label="Loading sign in" fullscreen />;
}

export default function AuthRoute() {
  const router = useNavigator();

  const handleSuccess = useCallback(async () => {
    // The session gate owns post-auth navigation.
  }, []);

  const handleBack = useCallback(() => {
    router.back('/welcome');
  }, [router]);

  const handleRecovery = useCallback(() => {
    router.push('/account-recovery');
  }, [router]);

  return (
    <ErrorBoundary name="AuthRoute">
      <Suspense fallback={<Fallback />}>
        <AuthScreen
          onSuccess={handleSuccess}
          onBack={handleBack}
          onNavigateRecovery={handleRecovery}
        />
      </Suspense>
    </ErrorBoundary>
  );
}
