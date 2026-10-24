import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import type { NetworkTransport, VergerEvent } from '@repo/core/verger';
import * as Battery from 'expo-battery';

/**
 * Gurudevi's device readings in JavaScript, as verger events: the network from NetInfo, the
 * battery and battery saver from expo-battery. Verger hears them as host signals: always in its
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
    stops.push(NetInfo.addEventListener((netState) => send(networkEventOf(netState, now()))));
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
  return events;
}
