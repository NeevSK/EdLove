import { accountPin } from '@repo/core/logic';
import { useAuthStore } from '@repo/core/store/useAuthStore';
import type { AccountPinModalSubmit } from '@repo/ui/components/AccountPinModal';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { AccountPinDialog } from '@/components/pin/AccountPinDialog';
import { useBootstrapSession } from '@/entry/BootstrapSessionProvider';

export interface AppLockConfig {
  /** Minimum background duration (ms) before re-locking a PIN-protected account. */
  readonly inactivityTimeoutMs: number;
  /** Whether a PIN-protected account also locks on cold launch. */
  readonly lockOnColdLaunch: boolean;
}

export const DEFAULT_APP_LOCK_CONFIG: AppLockConfig = {
  inactivityTimeoutMs: 5 * 60 * 1000,
  lockOnColdLaunch: true,
};

/**
 * Device-level PIN resume lock for admitted accounts that have configured an app PIN.
 *
 * Non-blocking for accounts without a PIN and for local guests. Reuses `AccountPinDialog`
 * (`mode="verify"`, `allowClose={false}`) and `@repo/core`'s `accountPin` adapter.
 */
export function AppLockOverlay({
  config = DEFAULT_APP_LOCK_CONFIG,
}: {
  readonly config?: AppLockConfig;
}) {
  const routeState = useBootstrapSession();
  const displayName = useAuthStore((s) => s.user?.display_name ?? null);
  const accountId =
    routeState.isProfileForSession && routeState.session?.user?.is_anonymous !== true
      ? routeState.principalId
      : null;

  const [hasPin, setHasPin] = useState(false);
  const [lockedAccountId, setLockedAccountId] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const backgroundedAtRef = useRef<number | null>(null);
  const checkedAccountRef = useRef<string | null>(null);

  useEffect(() => {
    if (!accountId) {
      checkedAccountRef.current = null;
      return;
    }
    let active = true;
    void accountPin
      .hasPin(accountId)
      .then((enabled) => {
        if (!active) return;
        setHasPin(enabled);
        if (enabled && config.lockOnColdLaunch && checkedAccountRef.current !== accountId) {
          checkedAccountRef.current = accountId;
          setLockedAccountId(accountId);
        }
      })
      .catch(() => {
        if (active) setHasPin(false);
      });
    return () => {
      active = false;
    };
  }, [accountId, config.lockOnColdLaunch]);

  useEffect(() => {
    if (!accountId || !hasPin) return;
    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'background' || nextState === 'inactive') {
        if (backgroundedAtRef.current === null) {
          backgroundedAtRef.current = Date.now();
        }
        return;
      }
      if (nextState === 'active' && backgroundedAtRef.current !== null) {
        const elapsed = Date.now() - backgroundedAtRef.current;
        backgroundedAtRef.current = null;
        if (elapsed >= config.inactivityTimeoutMs) {
          setError(null);
          setLockedAccountId(accountId);
        }
      }
    });
    return () => {
      subscription.remove();
    };
  }, [accountId, config.inactivityTimeoutMs, hasPin]);

  const handleSubmit = useCallback(
    async (values: AccountPinModalSubmit) => {
      const pin = 'pin' in values ? values.pin : values.currentPin;
      if (!accountId || !pin) return;
      setVerifying(true);
      setError(null);
      try {
        const ok = await accountPin.verifyPin(accountId, pin);
        if (ok) {
          setLockedAccountId(null);
        } else {
          setError('Incorrect PIN. Please try again.');
        }
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Unable to verify PIN.');
      } finally {
        setVerifying(false);
      }
    },
    [accountId],
  );

  const isLocked = Boolean(accountId && hasPin && lockedAccountId === accountId);
  if (!isLocked) return null;

  return (
    <AccountPinDialog
      isOpen
      mode="verify"
      allowClose={false}
      accountLabel={displayName ?? 'this account'}
      isLoading={verifying}
      error={error}
      onClose={() => undefined}
      onSubmit={handleSubmit}
    />
  );
}
