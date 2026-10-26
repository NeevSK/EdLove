import type { RuntimePort, VergerPlatform, VergerStore } from '@repo/verger-core';
import type { BrowserNavigator } from './browser';
import { capacityOfBrowser } from './mapping';

/** A browser has no hardware lever and no native sensor: readings arrive as host signals. */
const INERT_PORT: RuntimePort = {
  start: () => () => {},
  setRefreshCap: () => {},
  setCpuBoost: () => {},
};

/**
 * Verger's platform in a browser. Its facts come from the navigator; it senses nothing itself,
 * because every browser reading is JavaScript, fed by `browserSignals` as host signals, which
 * verger hears the same whether it runs or shows its floors. No exit history: a tab that dies
 * leaves no record, so the ladder judges only the markers it wrote.
 */
export function createVergerBrowserPlatform(nav: BrowserNavigator): VergerPlatform {
  return {
    readCapacity: () => capacityOfBrowser(nav),
    memorySensing: false,
    senses: [],
    createPort: () => INERT_PORT,
  };
}

/**
 * Verger's memory in `localStorage`. A storage that throws (a private window, blocked site data)
 * makes verger's launch fail closed and stay on its floors; nothing is lost but the ladder.
 */
export function browserStore(
  storage: () => Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>,
): VergerStore {
  // Read on every call: even reaching `localStorage` can throw.
  return {
    get: (key) => storage().getItem(key),
    set: (key, value) => storage().setItem(key, value),
    remove: (key) => storage().removeItem(key),
  };
}
