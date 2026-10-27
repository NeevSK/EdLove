import { beforeEach, describe, expect, it, vi } from 'vitest';

const values = vi.hoisted(() => new Map<string, string>());
const getAllKeys = vi.hoisted(() => vi.fn(async () => [...values.keys()]));
const multiGet = vi.hoisted(() =>
  vi.fn(async (keys: string[]) => keys.map((key) => [key, values.get(key) ?? null])),
);
const setItem = vi.hoisted(() =>
  vi.fn(async (key: string, value: string) => values.set(key, value)),
);
const removeItem = vi.hoisted(() => vi.fn(async (key: string) => values.delete(key)));

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getAllKeys,
    multiGet,
    getItem: async (key: string) => values.get(key) ?? null,
    setItem,
    removeItem,
    clear: async () => values.clear(),
  },
}));

import { AsyncStorageAdapter } from './AsyncStorageAdapter';

describe('AsyncStorageAdapter acknowledged writes', () => {
  beforeEach(() => {
    values.clear();
    getAllKeys.mockReset();
    getAllKeys.mockImplementation(async () => [...values.keys()]);
    multiGet.mockReset();
    multiGet.mockImplementation(async (keys) => keys.map((key) => [key, values.get(key) ?? null]));
    setItem.mockReset();
    setItem.mockImplementation(async (key, value) => {
      values.set(key, value);
    });
    removeItem.mockReset();
    removeItem.mockImplementation(async (key) => values.delete(key));
  });

  it('resolves set/delete/clear only after the backend operation resolves', async () => {
    const adapter = new AsyncStorageAdapter();
    await adapter.setAsync('saved', 'value');
    expect(values.get('saved')).toBe('value');
    expect(await adapter.getStringAsync('saved')).toBe('value');

    await adapter.deleteAsync('saved');
    expect(values.has('saved')).toBe(false);
    await adapter.setAsync('other', 'value');
    await adapter.clearAllAsync();
    expect(values.size).toBe(0);
  });

  it('propagates a failed durable write without updating the cache', async () => {
    const adapter = new AsyncStorageAdapter();
    setItem.mockRejectedValueOnce(new Error('disk unavailable'));

    await expect(adapter.setAsync('saved', 'value')).rejects.toThrow('disk unavailable');
    expect(adapter.getString('saved')).toBeUndefined();
  });

  it('serializes concurrent writes so an older completion cannot resurrect its value', async () => {
    const adapter = new AsyncStorageAdapter();
    let finishFirst!: () => void;
    setItem.mockImplementationOnce(
      (key, value) =>
        new Promise<void>((resolve) => {
          finishFirst = () => {
            values.set(key, value);
            resolve();
          };
        }),
    );

    const first = adapter.setAsync('same-key', 'old');
    const second = adapter.setAsync('same-key', 'new');
    await vi.waitFor(() => expect(setItem).toHaveBeenCalledTimes(1));
    finishFirst();
    await Promise.all([first, second]);

    expect(values.get('same-key')).toBe('new');
    expect(adapter.getString('same-key')).toBe('new');
  });

  it('keeps an acknowledged removal final after a queued write', async () => {
    const adapter = new AsyncStorageAdapter();
    const write = adapter.setAsync('same-key', 'pending');
    const remove = adapter.deleteAsync('same-key');

    await Promise.all([write, remove]);

    expect(values.has('same-key')).toBe(false);
    expect(adapter.contains('same-key')).toBe(false);
  });

  it('propagates cache initialization failures through awaited operations', async () => {
    getAllKeys.mockRejectedValueOnce(new Error('cache hydration failed'));
    const adapter = new AsyncStorageAdapter();

    await expect(adapter.setAsync('saved', 'value')).rejects.toThrow('cache hydration failed');
  });

  it('does not let an older hydration snapshot overwrite an early synchronous write', async () => {
    values.set('same-key', 'old-durable');
    let finishHydration!: (rows: [string, string | null][]) => void;
    multiGet.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finishHydration = resolve;
        }),
    );
    const adapter = new AsyncStorageAdapter();
    await vi.waitFor(() => expect(multiGet).toHaveBeenCalled());
    adapter.set('same-key', 'new-synchronous');
    finishHydration([['same-key', 'old-durable']]);

    await adapter.setAsync('barrier', 'done');
    expect(adapter.getString('same-key')).toBe('new-synchronous');
  });

  it('does not let a pending hydration snapshot repopulate cache after clear', async () => {
    values.set('same-key', 'old-durable');
    let finishHydration!: (rows: [string, string | null][]) => void;
    multiGet.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finishHydration = resolve;
        }),
    );
    const adapter = new AsyncStorageAdapter();
    await vi.waitFor(() => expect(multiGet).toHaveBeenCalled());
    adapter.clearAll();
    finishHydration([['same-key', 'old-durable']]);

    await adapter.setAsync('barrier', 'done');
    expect(adapter.getString('same-key')).toBeUndefined();
    expect(values.has('same-key')).toBe(false);
  });
});
