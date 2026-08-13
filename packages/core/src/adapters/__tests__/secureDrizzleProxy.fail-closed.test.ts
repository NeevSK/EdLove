import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createSecureDrizzleProxy,
  resetSecureDrizzleState,
} from '../powersync/secureDrizzleProxy';

describe('secureDrizzleProxy authorization boundary', () => {
  const execute = vi.fn().mockResolvedValue('driver_success');

  beforeEach(() => {
    vi.clearAllMocks();
    resetSecureDrizzleState();
  });

  it('forwards writes when no permission validator is registered', async () => {
    const db = createSecureDrizzleProxy({
      insert: vi.fn(() => ({ execute })),
    });

    await expect(db.insert({ _: { name: 'students' } }).execute()).resolves.toBe('driver_success');
    expect(execute).toHaveBeenCalledOnce();
  });
});
