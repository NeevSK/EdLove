import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import type { NetworkSnapshot } from '@repo/core/logic/interfaces/network.port';
import { networkManager } from '@repo/core/logic/managers/NetworkManager';
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
