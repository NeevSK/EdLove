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
import { type PropsWithChildren, useEffect, useRef } from 'react';
import { disconnectPowerSync, getPowerSyncDB } from '@/adapters/powersync/database';
import { PowerSyncContext } from '@/adapters/powersync/powersync-react-shim';
import { SupabasePowerSyncConnector } from '@/adapters/powersync/SupabasePowerSyncConnector';
import { sovereignBus } from '@/lib/sync/eventBus';
import { useStore } from '@/store/useStore';

interface PowerSyncGateProps extends PropsWithChildren {
  /** Override — if false, renders children without PowerSync context. */
  enabled?: boolean;
}

export function PowerSyncGate({ children, enabled = true }: PowerSyncGateProps) {
  const isPowerSyncEnabled = useStore((s) => s.flags.isPowerSyncEnabled);
  const isAnonymous = useStore((s) => s.user?.is_anonymous === true);
  const isActive = enabled && isPowerSyncEnabled && !isAnonymous;

  const connectorRef = useRef<SupabasePowerSyncConnector | null>(null);
  const db = isActive ? getPowerSyncDB() : null;

  useEffect(() => {
    if (!isActive || !db) return;

    connectorRef.current = new SupabasePowerSyncConnector();

    // Connect to the PowerSync replication stream
    db.connect(connectorRef.current).catch((err: unknown) => {
      console.error('[PowerSync] Connection failed. Falling back to Message Bus.', err);
      sovereignBus.emit('powersync:unavailable', { reason: 'service_down' });
    });

    return () => {
      // Disconnect on unmount (e.g. logout)
      disconnectPowerSync().catch(console.error);
    };
  }, [isActive, db]);

  if (!isActive || !db) {
    // Flag is off — render with no PowerSync overhead
    return <>{children}</>;
  }

  return <PowerSyncContext.Provider value={db}>{children}</PowerSyncContext.Provider>;
}
