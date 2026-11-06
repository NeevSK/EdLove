import { View } from 'react-native';
import { BrandPulse } from '@repo/ui';
import ErrorBoundary, { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { safeBack } from '@repo/ui/utils/navigation';
import { useRouter } from 'expo-router';
import { Suspense, useCallback } from 'react';
import AuthScreen from '../src/screens/AuthScreen';

export { RouteErrorBoundary as ErrorBoundary };

function Fallback() {
  return (
    <View className="items-center justify-center flex-1 bg-obsidian">
      <BrandPulse accessibilityLabel="Loading sign in" />
    </View>
  );
}

export default function AuthRoute() {
  const router = useRouter();

  const handleSuccess = useCallback(async () => {
    // The session gate owns post-auth navigation.
  }, []);

  const handleBack = useCallback(() => {
    safeBack('/welcome');
  }, []);

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
