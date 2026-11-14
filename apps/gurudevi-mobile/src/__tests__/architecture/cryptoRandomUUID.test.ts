import { afterEach, describe, expect, it, vi } from 'vitest';

const native = vi.hoisted(() => ({
  randomUUID: vi.fn(() => '45f81be8-d394-4bd1-bdbc-ff643f573044'),
}));
vi.mock('expo-crypto', () => native);

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
  native.randomUUID.mockClear();
});

describe('native UUID bootstrap / substituted Expo Crypto', () => {
  it('adds secure UUID generation without replacing getRandomValues', async () => {
    const getRandomValues = vi.fn();
    vi.stubGlobal('crypto', { getRandomValues });
    await import('@/shims/crypto-random-uuid');
    expect(globalThis.crypto.getRandomValues).toBe(getRandomValues);
    expect(globalThis.crypto.randomUUID()).toBe('45f81be8-d394-4bd1-bdbc-ff643f573044');
    expect(native.randomUUID).toHaveBeenCalledOnce();
  });

  it('retains an existing platform implementation', async () => {
    const randomUUID = vi.fn();
    vi.stubGlobal('crypto', { randomUUID });
    await import('@/shims/crypto-random-uuid');
    expect(globalThis.crypto.randomUUID).toBe(randomUUID);
    expect(native.randomUUID).not.toHaveBeenCalled();
  });
});
