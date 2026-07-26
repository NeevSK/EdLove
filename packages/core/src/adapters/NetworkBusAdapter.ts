/**
 * NetworkBusAdapter — May 2026
 *
 * Subscribes to NetInfo changes and emits them on the SovereignBus.
 * This is the adapter that closes "Gap 3" — the foreground UI and background
 * workers can now listen to `network:online` / `network:offline` events
 * without coupling to NetInfo directly.
 *
 * Call `startNetworkBusAdapter()` once at bootstrap in `bootstrapPlatform()`.
 */
import NetInfo from '@react-native-community/netinfo';
import { sovereignBus } from '@/lib/sync/eventBus';
import { useStore } from '@/store/useStore';

let _unsubscribe: (() => void) | null = null;

export function startNetworkBusAdapter(): void {
  if (_unsubscribe) return; // already running

  _unsubscribe = NetInfo.addEventListener((state) => {
    const isNowOnline = !!state.isConnected && state.isInternetReachable !== false;
    const prevOnline = useStore.getState().isOnline;

    // Only emit on actual transitions to avoid thrashing
    if (isNowOnline && !prevOnline) {
      sovereignBus.emit('network:online', { timestamp: Date.now() });
    } else if (!isNowOnline && prevOnline) {
      sovereignBus.emit('network:offline', { timestamp: Date.now() });
    }

    // Keep the store in sync (this is still the source of truth for SyncManager)
    useStore.getState().setIsOnline?.(isNowOnline);
  });
}

export function stopNetworkBusAdapter(): void {
  _unsubscribe?.();
  _unsubscribe = null;
}
