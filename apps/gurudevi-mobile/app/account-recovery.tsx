import { deviceAccounts } from '@repo/core';
import { useAuth } from '@repo/core/logic';
import ErrorBoundary, { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { useSanctuaryToast } from '@repo/ui/providers/ToastProvider';
import { useCallback, useState } from 'react';
import { AccountRecoveryScreen } from '@/screens/AccountRecoveryScreen';
import { useNavigator } from '@repo/ui/components/native/navigation';

export { RouteErrorBoundary as ErrorBoundary };

export default function AccountRecoveryRoute() {
  const router = useNavigator();
  const { accountLifecycleStatus, refreshProfile } = useAuth();
  const { showToast } = useSanctuaryToast();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleRetry = useCallback(() => {
    void refreshProfile();
  }, [refreshProfile]);

  const handleSignOut = useCallback(() => {
    if (isSigningOut) return;

    setIsSigningOut(true);
    void deviceAccounts
      .signOutCurrentAccount()
      .then(() => {
        router.replace('/welcome');
      })
      .catch((error: unknown) => {
        console.warn('[account recovery] local sign-out failed', error);
        showToast({
          message:
            error instanceof Error
              ? error.message
              : 'Could not sign out on this device. Please try again.',
          type: 'error',
        });
        setIsSigningOut(false);
      });
  }, [isSigningOut, router, showToast]);

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
