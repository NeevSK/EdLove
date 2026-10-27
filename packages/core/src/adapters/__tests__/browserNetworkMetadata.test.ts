import { afterEach, describe, expect, it, vi } from 'vitest';
import { WebNetworkAdapter } from '../WebNetworkAdapter';

afterEach(() => vi.unstubAllGlobals());

describe('shared browser connection estimates', () => {
  it('publishes connection changes once, keeps unknown estimates neutral and releases the observer', () => {
    const connection = Object.assign(new EventTarget(), {
      type: 'wifi',
      effectiveType: '4g',
      rtt: 50,
      downlink: 10,
      saveData: false,
    });
    vi.stubGlobal('window', new EventTarget());
    vi.stubGlobal('navigator', { onLine: true, connection });
    const adapter = new WebNetworkAdapter();
    const changed = vi.fn();
    const stop = adapter.subscribe(changed);
    const initial = adapter.getSnapshot();
    expect(initial.connection).toMatchObject({
      type: 'wifi',
      rttMs: 50,
      downKbps: 10000,
      dataSaver: false,
      isMetered: null,
    });
    connection.dispatchEvent(new Event('change'));
    expect(adapter.getSnapshot()).toBe(initial);
    connection.saveData = true;
    connection.rtt = Number.NaN;
    connection.downlink = -1;
    connection.dispatchEvent(new Event('change'));
    expect(adapter.getSnapshot().connection).toMatchObject({
      dataSaver: true,
      rttMs: null,
      downKbps: null,
    });
    const afterChange = adapter.getSnapshot();
    stop();
    connection.saveData = false;
    connection.dispatchEvent(new Event('change'));
    expect(adapter.getSnapshot()).toBe(afterChange);
  });
});
