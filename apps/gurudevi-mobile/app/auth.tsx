import { authAPI } from '@repo/core/api/client';
import { BrandPulse } from '@repo/ui';
import ErrorBoundary, { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { Center } from '@repo/ui/primitives';
import { safeBack } from '@repo/ui/utils/navigation';
import { useLocalSearchParams } from 'expo-router';
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
  const { mode } = useLocalSearchParams<{ mode?: 'login' | 'signup' }>();

  const handleSuccess = useCallback(async () => {
    // The session gate owns post-auth navigation.
  }, []);

  const handleBack = useCallback(() => {
    safeBack('/welcome');
  }, []);

  const handleGuest = useCallback(async () => {
    await authAPI.signInAnonymously();
  }, []);

  return (
    <ErrorBoundary name="AuthRoute">
      <Suspense fallback={<Fallback />}>
        <AuthScreen
          initialMode={mode === 'login' ? 'login' : 'signup'}
          onSuccess={handleSuccess}
          onBack={handleBack}
          onContinueAsGuest={handleGuest}
        />
      </Suspense>
    </ErrorBoundary>
  );
}
