import { afterEach, describe, expect, it, vi } from 'vitest';

import { getPowerSyncDB } from '../powersync/database';

describe('PowerSync database bootstrap guard', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fails loudly in the browser before the runtime is registered', () => {
    vi.stubGlobal('window', {});

    expect(() => getPowerSyncDB()).toThrow(
      /PowerSync bootstrap guard: browser code touched PowerSync before the app was ready/i,
    );
  });
});
