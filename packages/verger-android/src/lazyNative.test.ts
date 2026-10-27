import { beforeEach, describe, expect, it, vi } from 'vitest';

const requireOptionalNativeModule = vi.fn(() => null);
vi.mock('expo', () => ({ NativeModule: class {}, requireOptionalNativeModule }));

describe('the native module is looked up on first use, never at import', () => {
  beforeEach(() => {
    vi.resetModules();
    requireOptionalNativeModule.mockClear();
  });

  it('importing the package touches no native code; the first platform looks once', async () => {
    const android = await import('../index');
    expect(requireOptionalNativeModule).not.toHaveBeenCalled();
    const platform = android.createVergerAndroidPlatform();
    expect(requireOptionalNativeModule).toHaveBeenCalledTimes(1);
    // Without the module: unknown facts, nothing sensed natively, an inert port.
    expect(platform.senses).toEqual([]);
    expect(android.isVergerAndroidAvailable()).toBe(false);
    android.createVergerAndroidPlatform();
    expect(requireOptionalNativeModule).toHaveBeenCalledTimes(1);
  });
});
