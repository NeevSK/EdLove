import { authAPI } from '@repo/core/api/auth';
import { useAuth } from '@repo/core/logic';
import ErrorBoundary, { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { AccountRecoveryScreen } from '@/screens/AccountRecoveryScreen';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

export { RouteErrorBoundary as ErrorBoundary };

export default function AccountRecoveryRoute() {
  const router = useRouter();
  const { accountLifecycleStatus, refreshProfile } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleRetry = useCallback(() => {
    void refreshProfile();
  }, [refreshProfile]);

  const handleSignOut = useCallback(() => {
    if (isSigningOut) return;

    setIsSigningOut(true);
    void authAPI
      .signOut()
      .then(() => {
        router.replace('/welcome');
      })
      .catch((error: unknown) => {
        console.warn('[account recovery] local sign-out failed', error);
        setIsSigningOut(false);
      });
  }, [isSigningOut, router]);

  return (
    <ErrorBoundary name="AccountRecoveryRoute">
      <AccountRecoveryScreen
        deactivatedAt={accountLifecycleStatus?.deactivated_at ?? null}
        scheduledFor={accountLifecycleStatus?.scheduled_for ?? null}
        isSigningOut={isSigningOut}
        onRetry={handleRetry}
        onSignOut={handleSignOut}
      />
    </ErrorBoundary>
  );
}
