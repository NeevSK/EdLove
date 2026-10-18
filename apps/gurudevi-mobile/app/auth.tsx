import { BrandPulse } from '@repo/ui';
import ErrorBoundary, { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { Center } from '@repo/ui/primitives';
import { safeBack } from '@repo/ui/utils/navigation';
import { Suspense, useCallback } from 'react';
import AuthScreen from '../src/screens/AuthScreen';

export { RouteErrorBoundary as ErrorBoundary };

function Fallback() {
  return (
    <Center className="flex-1 bg-obsidian">
      <BrandPulse accessibilityLabel="Loading sign in" />
    </Center>
  );
}

export default function AuthRoute() {
  const handleSuccess = useCallback(async () => {
    // The session gate owns post-auth navigation.
  }, []);

  const handleBack = useCallback(() => {
    safeBack('/welcome');
  }, []);

  return (
    <ErrorBoundary name="AuthRoute">
      <Suspense fallback={<Fallback />}>
        <AuthScreen onSuccess={handleSuccess} onBack={handleBack} />
      </Suspense>
    </ErrorBoundary>
  );
}
