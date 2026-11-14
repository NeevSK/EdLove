import type { VergerEvent } from '@repo/verger-core';
import type {
  BrowserBattery,
  BrowserNavigator,
  BrowserPressureObserverConstructor,
} from './browser';
import { batteryEventOfBrowser, networkEventOfBrowser, storageEventOfEstimate } from './mapping';

/** A host may supply its shared observation; it sends an initial reading and returns cleanup. */
export type BrowserNetworkSignals = (
  send: (event: Extract<VergerEvent, { type: 'network' }>) => void,
  now: () => number,
) => () => void;

export interface BrowserEnvironment {
  readonly window: Pick<Window, 'addEventListener' | 'removeEventListener'>;
  readonly navigator: BrowserNavigator;
  readonly networkSignals?: BrowserNetworkSignals;
  /** `window.PressureObserver`, where the browser has it (R10). */
  readonly PressureObserver?: BrowserPressureObserverConstructor;
}

/** How often the browser is asked for the CPU pressure state while it holds, in ms. */
const PRESSURE_SAMPLE_MS = 2_000;

/**
 * The browser's device readings as verger events, sent at start and on every change: the
 * network (online and offline events, Network Information changes), the battery (Battery
 * Status, where the browser has it) and the origin's storage (at start and whenever the window
 * regains focus: the estimate has no change event), and the system's CPU pressure (Compute
 * Pressure, where the browser has it). Returns a function that stops them all.
 */
export function browserSignals(
  env: BrowserEnvironment,
  dispatch: (event: VergerEvent) => void,
  now: () => number,
): () => void {
  let live = true;
  const { window: win, navigator: nav } = env;
  const network = () => {
    if (live) dispatch(networkEventOfBrowser(nav, now()));
  };
  const stopNetwork = env.networkSignals?.((event) => {
    if (live) dispatch(event);
  }, now);
  if (!env.networkSignals) {
    network();
    win.addEventListener('online', network);
    win.addEventListener('offline', network);
    nav.connection?.addEventListener('change', network);
  }

  let battery: BrowserBattery | null = null;
  const onBattery = () => {
    if (live && battery) dispatch(batteryEventOfBrowser(battery, now()));
  };
  nav
    .getBattery?.()
    .then((found) => {
      if (!live) return;
      battery = found;
      found.addEventListener('levelchange', onBattery);
      found.addEventListener('chargingchange', onBattery);
      onBattery();
    })
    .catch((error: unknown) => console.warn('[verger] battery status unavailable', error));

  const storage = () => {
    nav.storage
      ?.estimate()
      .then((estimate) => {
        if (live) dispatch(storageEventOfEstimate(estimate, now()));
      })
      .catch((error: unknown) => console.warn('[verger] storage estimate unavailable', error));
  };
  storage();
  win.addEventListener('focus', storage);

  let pressure: { disconnect(): void } | null = null;
  if (env.PressureObserver) {
    const observer = new env.PressureObserver((records) => {
      const last = records[records.length - 1];
      if (live && last && last.source === 'cpu')
        dispatch({ type: 'compute-pressure', at: now(), state: last.state });
    });
    pressure = observer;
    observer
      .observe('cpu', { sampleInterval: PRESSURE_SAMPLE_MS })
      .catch((error: unknown) => console.warn('[verger] compute pressure unavailable', error));
  }

  return () => {
    live = false;
    pressure?.disconnect();
    stopNetwork?.();
    win.removeEventListener('focus', storage);
    win.removeEventListener('online', network);
    win.removeEventListener('offline', network);
    nav.connection?.removeEventListener('change', network);
    battery?.removeEventListener('levelchange', onBattery);
    battery?.removeEventListener('chargingchange', onBattery);
  };
}
