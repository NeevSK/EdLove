import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import type { NetworkSnapshot } from '@repo/core/logic/interfaces/network.port';
import { networkManager } from '@repo/core/logic/managers/NetworkManager';
import type { NetworkTransport, VergerEvent } from '@repo/core/verger';
import * as Battery from 'expo-battery';
import { Paths } from 'expo-file-system';
import { AppState } from 'react-native';

/**
 * Gurudevi's device readings in JavaScript, as verger events: the network from NetInfo, the
 * battery and battery saver from expo-battery, free storage from expo-file-system. Verger hears them as host signals: always in its
 * floors, and while it runs only where the platform does not sense them natively. Background
 * tasks, which run without verger, read them once.
 */

const TRANSPORT: Readonly<Record<string, NetworkTransport>> = {
  wifi: 'wifi',
  cellular: 'cellular',
  ethernet: 'ethernet',
  none: 'none',
};

/** NetInfo's state as verger's network event. Unknown stays unknown, never offline. */
export function networkEventOf(
  state: Pick<NetInfoState, 'type' | 'isConnected' | 'isInternetReachable' | 'details'>,
  at: number,
): VergerEvent {
  const transport =
    state.isConnected === false
      ? 'none'
      : state.type === 'unknown'
        ? null
        : (TRANSPORT[state.type] ?? 'other');
  const details = state.details;
  return {
    type: 'network',
    at,
    transport,
    validated: state.isInternetReachable,
    metered:
      details !== null && 'isConnectionExpensive' in details ? details.isConnectionExpensive : null,
    // NetInfo gives no bandwidth estimate, and no Data Saver state.
    downKbps: null,
    dataSaver: null,
  };
}

/** expo-battery's level (0 to 1, or -1) and state as verger's battery event. */
export function batteryEventOf(
  level: number,
  state: Battery.BatteryState,
  at: number,
): VergerEvent {
  return {
    type: 'battery',
    at,
    levelPercent: level >= 0 && level <= 1 ? Math.round(level * 100) : null,
    pluggedIn:
      state === Battery.BatteryState.UNKNOWN ? null : state !== Battery.BatteryState.UNPLUGGED,
    temperatureC: null,
  };
}

/** expo-file-system's free disk space as verger's storage event; a bad reading is unknown. */
export function storageEventOf(availableBytes: number, at: number): VergerEvent {
  const known = Number.isFinite(availableBytes) && availableBytes >= 0;
  return { type: 'storage', at, freeBytes: known ? availableBytes : null };
}

/** `Paths.availableDiskSpace` is a synchronous native read: cheap, but it may throw. */
const readStorage = (at: number): VergerEvent => storageEventOf(Paths.availableDiskSpace, at);

/** Reuse the app's platform observation, including indeterminate reachability. */
export function networkSnapshotEventOf(snapshot: NetworkSnapshot, at: number): VergerEvent {
  return {
    type: 'network',
    at,
    transport:
      snapshot.connection?.type === 'none'
        ? 'none'
        : snapshot.connection?.type && snapshot.connection.type !== 'unknown'
          ? (TRANSPORT[snapshot.connection.type] ?? 'other')
          : null,
    validated: snapshot.status === 'unknown' ? null : snapshot.status === 'online',
    metered: snapshot.connection?.isMetered ?? null,
    downKbps: null,
    dataSaver: null,
  };
}

/** Live signals for `VergerRoot`: every change is sent; a failed source is logged and skipped. */
export function deviceSignals(
  dispatch: (event: VergerEvent) => void,
  now: () => number,
): () => void {
  let live = true;
  const send = (event: VergerEvent) => {
    if (live) dispatch(event);
  };
  const failed = (what: string) => (error: unknown) =>
    console.warn(`[verger] ${what} unavailable`, error);
  const stops: (() => void)[] = [];
  let level = -1;
  let state: Battery.BatteryState = Battery.BatteryState.UNKNOWN;

  try {
    const updateNetwork = () => send(networkSnapshotEventOf(networkManager.getSnapshot(), now()));
    stops.push(networkManager.subscribe(updateNetwork));
    updateNetwork();
  } catch (error) {
    failed('network')(error);
  }
  try {
    Battery.getPowerStateAsync()
      .then((power) => {
        level = power.batteryLevel;
        state = power.batteryState;
        send({ type: 'power', at: now(), saver: power.lowPowerMode });
        send(batteryEventOf(level, state, now()));
      })
      .catch(failed('battery'));
    const subscriptions = [
      Battery.addLowPowerModeListener(({ lowPowerMode }) =>
        send({ type: 'power', at: now(), saver: lowPowerMode }),
      ),
      Battery.addBatteryLevelListener(({ batteryLevel }) => {
        level = batteryLevel;
        send(batteryEventOf(level, state, now()));
      }),
      Battery.addBatteryStateListener(({ batteryState }) => {
        state = batteryState;
        send(batteryEventOf(level, state, now()));
      }),
    ];
    stops.push(() => {
      for (const subscription of subscriptions) subscription.remove();
    });
  } catch (error) {
    failed('battery')(error);
  }
  // Free space has no change event: read at start and whenever the app comes to the front.
  const storage = () => {
    try {
      send(readStorage(now()));
    } catch (error) {
      failed('storage')(error);
    }
  };
  storage();
  try {
    const subscription = AppState.addEventListener('change', (status) => {
      if (status === 'active') storage();
    });
    stops.push(() => subscription.remove());
  } catch (error) {
    failed('storage')(error);
  }
  return () => {
    live = false;
    for (const stop of stops) stop();
  };
}

/**
 * The readings once, for work that runs without verger (background tasks). A source that fails
 * is left out, so its account stays unknown, and unknown is never a limit.
 */
export async function readDeviceEvents(at: number): Promise<VergerEvent[]> {
  const [network, power] = await Promise.allSettled([
    NetInfo.fetch(),
    Battery.getPowerStateAsync(),
  ]);
  const events: VergerEvent[] = [];
  if (network.status === 'fulfilled') events.push(networkEventOf(network.value, at));
  else console.warn('[verger] network unavailable', network.reason);
  if (power.status === 'fulfilled') {
    events.push({ type: 'power', at, saver: power.value.lowPowerMode });
    events.push(batteryEventOf(power.value.batteryLevel, power.value.batteryState, at));
  } else console.warn('[verger] battery unavailable', power.reason);
  try {
    events.push(readStorage(at));
  } catch (error) {
    console.warn('[verger] storage unavailable', error);
  }
  return events;
}
