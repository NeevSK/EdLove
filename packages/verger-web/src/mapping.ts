import {
  type CapacityFacts,
  type NetworkTransport,
  UNKNOWN_CAPACITY,
  type VergerEvent,
} from '@repo/verger-core';
import type { BrowserBattery, BrowserNavigator } from './browser';

const GIB = 1024 ** 3;

/**
 * What a browser says about the device. Memory is coarse (a power of two, within the browser's
 * own bounds) but it is what the page can know; everything else stays unknown, so no capability
 * floor applies.
 */
export function capacityOfBrowser(
  nav: Pick<BrowserNavigator, 'deviceMemory' | 'hardwareConcurrency'>,
): CapacityFacts {
  const memory = nav.deviceMemory;
  const cores = nav.hardwareConcurrency;
  return {
    ...UNKNOWN_CAPACITY,
    totalMemoryBytes: typeof memory === 'number' && memory > 0 ? memory * GIB : null,
    cpuCores: typeof cores === 'number' && cores > 0 ? cores : null,
  };
}

const TRANSPORT: Readonly<Record<string, NetworkTransport>> = {
  wifi: 'wifi',
  cellular: 'cellular',
  ethernet: 'ethernet',
  none: 'none',
};

/**
 * The browser's network as verger's event. Offline is known (`navigator.onLine` false); online
 * is not proof the internet is reachable, so `validated` stays unknown. Save-Data is the user's
 * Data Saver. No metered flag exists on the web.
 */
export function networkEventOfBrowser(
  nav: Pick<BrowserNavigator, 'onLine' | 'connection'>,
  at: number,
): VergerEvent {
  const connection = nav.connection;
  const type = connection?.type;
  return {
    type: 'network',
    at,
    transport: !nav.onLine
      ? 'none'
      : type === undefined || type === 'unknown'
        ? null
        : (TRANSPORT[type] ?? 'other'),
    validated: nav.onLine ? null : false,
    metered: null,
    downKbps:
      typeof connection?.downlink === 'number' && connection.downlink >= 0
        ? Math.round(connection.downlink * 1000)
        : null,
    dataSaver:
      connection?.saveData === undefined ? null : connection.saveData ? 'enabled' : 'disabled',
  };
}

/**
 * The Battery Status API as verger's event. `charging` false on a full battery may still be
 * plugged in, so a full, not-charging battery reads as unknown plug state.
 */
export function batteryEventOfBrowser(
  battery: Pick<BrowserBattery, 'level' | 'charging'>,
  at: number,
): VergerEvent {
  const level = battery.level;
  return {
    type: 'battery',
    at,
    levelPercent: level >= 0 && level <= 1 ? Math.round(level * 100) : null,
    pluggedIn: battery.charging ? true : level >= 1 ? null : false,
    temperatureC: null,
  };
}
