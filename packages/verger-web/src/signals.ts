import type { VergerEvent } from '@repo/verger-core';
import type { BrowserBattery, BrowserNavigator } from './browser';
import { batteryEventOfBrowser, networkEventOfBrowser, storageEventOfEstimate } from './mapping';

export interface BrowserEnvironment {
  readonly window: Pick<Window, 'addEventListener' | 'removeEventListener'>;
  readonly navigator: BrowserNavigator;
}

/**
 * The browser's device readings as verger events, sent at start and on every change: the
 * network (online and offline events, Network Information changes), the battery (Battery
 * Status, where the browser has it) and the origin's storage (at start and whenever the window
 * regains focus: the estimate has no change event). Returns a function that stops them all.
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
  network();
  win.addEventListener('online', network);
  win.addEventListener('offline', network);
  nav.connection?.addEventListener('change', network);

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

  return () => {
    live = false;
    win.removeEventListener('focus', storage);
    win.removeEventListener('online', network);
    win.removeEventListener('offline', network);
    nav.connection?.removeEventListener('change', network);
    battery?.removeEventListener('levelchange', onBattery);
    battery?.removeEventListener('chargingchange', onBattery);
  };
}
