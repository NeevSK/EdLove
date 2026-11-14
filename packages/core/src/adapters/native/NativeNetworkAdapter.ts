import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import type {
  INetwork,
  NetworkConnectionMetadata,
  NetworkSnapshot,
  NetworkStatus,
} from '@repo/core/logic/interfaces/network.port';

const INITIAL_SNAPSHOT: NetworkSnapshot = Object.freeze({
  status: 'unknown',
  source: 'native-netinfo',
  connection: null,
});

function statusFor(state: NetInfoState): NetworkStatus {
  if (state.isConnected === false || state.isInternetReachable === false) return 'offline';
  if (state.isConnected === true && state.isInternetReachable === true) return 'online';
  return 'unknown';
}

function connectionFor(state: NetInfoState): NetworkConnectionMetadata {
  const details = state.details;
  return {
    type: state.type,
    isMetered: details && 'isConnectionExpensive' in details ? details.isConnectionExpensive : null,
    cellularGeneration:
      state.type === 'cellular' ? state.details.cellularGeneration : null,
  };
}

/** Uses NetInfo's shared listener and keeps indeterminate reachability explicit. */
export class NativeNetworkAdapter implements INetwork {
  private snapshot: NetworkSnapshot = INITIAL_SNAPSHOT;
  private readonly listeners = new Set<() => void>();
  private unsubscribeNetInfo: (() => void) | null = null;

  getSnapshot(): NetworkSnapshot {
    return this.snapshot;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    if (this.listeners.size === 1) {
      this.unsubscribeNetInfo = NetInfo.addEventListener((state) => this.publish(state));
    }
    listener();

    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size === 0) {
        this.unsubscribeNetInfo?.();
        this.unsubscribeNetInfo = null;
      }
    };
  }

  private publish(state: NetInfoState): void {
    const status = statusFor(state);
    const previous = this.snapshot;
    const connection = connectionFor(state);
    if (
      status === previous.status &&
      connection.type === previous.connection?.type &&
      connection.isMetered === previous.connection?.isMetered &&
      connection.cellularGeneration === previous.connection?.cellularGeneration
    ) {
      return;
    }

    this.snapshot = { status, source: 'native-netinfo', connection };
    for (const listener of this.listeners) listener();
  }
}
