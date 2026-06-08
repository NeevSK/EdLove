import { afterEach, describe, expect, it, vi } from 'vitest';
import { assertHighway, assertPowerSyncBootstrapReady } from '../highways';

describe('data highways', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fails loudly when identity bootstrap is routed through the wrong highway', () => {
    expect(() => assertHighway('identity_bootstrap', 'power-sync')).toThrow(
      /identity_bootstrap.*must use "direct-api".*authoritative API/i,
    );
  });

  it('allows identity bootstrap to stay on the direct API highway', () => {
    expect(() => assertHighway('identity_bootstrap', 'direct-api')).not.toThrow();
  });

  it('fails loudly when browser bootstrap touches PowerSync too early', () => {
    vi.stubGlobal('window', {});

    expect(() => assertPowerSyncBootstrapReady()).toThrow(
      /PowerSync bootstrap guard: browser code touched PowerSync before the app was ready/i,
    );
  });
});
