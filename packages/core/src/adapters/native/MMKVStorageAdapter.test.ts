import { describe, expect, it, vi } from 'vitest';
import { MMKVStorageAdapter, type NativeKeyValueStore } from './MMKVStorageAdapter';

function createMMKVFixture() {
  const values = new Map<string, string | number | boolean>();
  const mmkv = {
    set: vi.fn((key: string, value: string | number | boolean) => values.set(key, value)),
    getString: vi.fn((key: string) => {
      const value = values.get(key);
      return typeof value === 'string' ? value : undefined;
    }),
    getBoolean: vi.fn((key: string) => {
      const value = values.get(key);
      return typeof value === 'boolean' ? value : undefined;
    }),
    getNumber: vi.fn((key: string) => {
      const value = values.get(key);
      return typeof value === 'number' ? value : undefined;
    }),
    remove: vi.fn((key: string) => values.delete(key)),
    clearAll: vi.fn(() => values.clear()),
    contains: vi.fn((key: string) => values.has(key)),
  } satisfies NativeKeyValueStore;
  return { mmkv, values };
}

describe('MMKVStorageAdapter', () => {
  it('uses the installed remove API and exposes acknowledged synchronous completion', async () => {
    const { mmkv, values } = createMMKVFixture();
    const adapter = new MMKVStorageAdapter(mmkv);

    await adapter.setAsync('key', 'value');
    expect(values.get('key')).toBe('value');
    await adapter.deleteAsync('key');
    expect(mmkv.remove).toHaveBeenCalledWith('key');
    expect(values.has('key')).toBe(false);
  });

  it('propagates native set failures through the async contract', async () => {
    const { mmkv } = createMMKVFixture();
    vi.mocked(mmkv.set).mockImplementation(() => {
      throw new Error('native write failed');
    });

    await expect(new MMKVStorageAdapter(mmkv).setAsync('key', 'value')).rejects.toThrow(
      'native write failed',
    );
  });
});
