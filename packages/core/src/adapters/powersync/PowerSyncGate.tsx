/**
 * PowerSyncProvider — Feature-Gated Context Provider (May 2026)
 *
 * Wraps the app with the PowerSync context when `isPowerSyncEnabled` is true.
 * When the flag is off, renders children directly — zero overhead.
 *
 * Placement: Mount this INSIDE the existing AuthProvider/FeatureProvider,
 * after the user is authenticated (we need a session for fetchCredentials).
 *
 * @example
 * // In the root Expo Router layout, inside your provider tree:
 * <PowerSyncGate>
 *   <Stack>...</Stack>
 * </PowerSyncGate>
 */

import { getActivePowerSyncDB } from '@repo/core/adapters/powersync/database';
import { PowerSyncContext } from '@repo/core/adapters/powersync/powersync-react-shim';
import { isLocalOnlyIdentity } from '@repo/core/logic/auth/identityState';
import { useStore } from '@repo/core/store/useStore';
import { type PropsWithChildren } from 'react';

interface PowerSyncGateProps extends PropsWithChildren {
  /** Override — if false, renders children without PowerSync context. */
  enabled?: boolean;
}

export function PowerSyncGate({ children, enabled = true }: PowerSyncGateProps) {
  const isPowerSyncEnabled = useStore((s) => s.flags.isPowerSyncEnabled);
  const user = useStore((s) => s.user);
  const isActive = enabled && isPowerSyncEnabled && !isLocalOnlyIdentity(user);

  const db = isActive ? getActivePowerSyncDB() : null;

  if (!isActive || !db) {
    if (isActive && !db) {
      console.error('[PowerSync] Feature enabled without an active provider runtime.');
    }
    return <>{children}</>;
  }

  return <PowerSyncContext.Provider value={db as any}>{children}</PowerSyncContext.Provider>;
}
