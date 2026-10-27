import { stopNetworkBusAdapter } from '@repo/core/adapters/NetworkBusAdapter';
import { WebNetworkAdapter } from '@repo/core/adapters/WebNetworkAdapter';
import { networkManager } from '@repo/core/logic/managers/NetworkManager';
import type { VergerEvent } from '@repo/core/verger';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { browserNetworkSignals } from '@/lib/runtime/browserNetwork';

afterEach(() => {
  stopNetworkBusAdapter();
  vi.unstubAllGlobals();
});

describe('Gurudevi browser network to Verger', () => {
  it('preserves browser uncertainty, sends data-saver changes and releases its subscription', () => {
    const connection = Object.assign(new EventTarget(), {
      type: 'wifi',
      downlink: 2.5,
      saveData: false,
    });
    Object.defineProperty(navigator, 'connection', { configurable: true, value: connection });
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: true });
    networkManager.registerAdapter(new WebNetworkAdapter());
    const events: VergerEvent[] = [];
    const stop = browserNetworkSignals(
      (event) => events.push(event),
      () => 7,
    );
    expect(events.at(-1)).toMatchObject({
      transport: 'wifi',
      validated: null,
      metered: null,
      downKbps: 2500,
      dataSaver: 'disabled',
    });
    connection.saveData = true;
    connection.dispatchEvent(new Event('change'));
    expect(events.at(-1)).toMatchObject({ dataSaver: 'enabled' });
    window.dispatchEvent(new Event('offline'));
    expect(events.at(-1)).toMatchObject({ transport: 'none', validated: false });
    const count = events.length;
    stop();
    window.dispatchEvent(new Event('online'));
    expect(events).toHaveLength(count);
    Reflect.deleteProperty(navigator, 'connection');
    Reflect.deleteProperty(navigator, 'onLine');
  });
});
