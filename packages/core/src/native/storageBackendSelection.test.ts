import { beforeEach, describe, expect, it, vi } from 'vitest';

const values = vi.hoisted(() => new Map<string, string>());
const setItem = vi.hoisted(() =>
  vi.fn(async (key: string, value: string) => values.set(key, value)),
);
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getAllKeys: async () => [...values.keys()],
    multiGet: async (keys: string[]) => keys.map((key) => [key, values.get(key) ?? null]),
    getItem: async (key: string) => values.get(key) ?? null,
    setItem,
    removeItem: async (key: string) => values.delete(key),
    clear: async () => values.clear(),
  },
}));

import {
  MMKVStorageAdapter,
  type NativeKeyValueStore,
} from '@repo/core/adapters/native/MMKVStorageAdapter';
import { selectNativeStorageAdapter } from './storageBackendSelection';

function createMMKVModule(existing = new Map<string, string>()) {
  const mmkv = {
    set: vi.fn((key: string, value: string | number | boolean) => existing.set(key, String(value))),
    getString: vi.fn((key: string) => existing.get(key)),
    getBoolean: vi.fn(),
    getNumber: vi.fn(),
    remove: vi.fn((key: string) => existing.delete(key)),
    clearAll: vi.fn(() => existing.clear()),
    contains: vi.fn((key: string) => existing.has(key)),
  } satisfies NativeKeyValueStore;
  return {
    values: existing,
    createMMKV: vi.fn(() => mmkv),
    existsMMKV: vi.fn(() => existing.size > 0),
  };
}

describe('native storage backend selection', () => {
  beforeEach(() => {
    values.clear();
    setItem.mockReset();
    setItem.mockImplementation(async (key, value) => values.set(key, value));
  });

  it('keeps AsyncStorage selected when MMKV is not requested', async () => {
    const loadMMKV = vi.fn();
    const adapter = await selectNativeStorageAdapter({ useMMKV: false, loadMMKV });

    expect(adapter).not.toBeInstanceOf(MMKVStorageAdapter);
    expect(loadMMKV).not.toHaveBeenCalled();
  });

  it('copies missing keys, verifies them and marks MMKV selected without deleting source data', async () => {
    values.set('existing', 'from-async');
    const module = createMMKVModule(new Map([['already', 'from-mmkv']]));
    values.set('already', 'stale-async');

    const adapter = await selectNativeStorageAdapter({
      useMMKV: true,
      loadMMKV: async () => module,
    });

    expect(adapter).toBeInstanceOf(MMKVStorageAdapter);
    expect(module.values.get('existing')).toBe('from-async');
    expect(module.values.get('already')).toBe('from-mmkv');
    expect(values.get('existing')).toBe('from-async');
    expect(values.get('@polymath/storage/selected-backend')).toBe('mmkv');
  });

  it('keeps using marked MMKV if the opt-in flag changes and refuses AsyncStorage fallback', async () => {
    values.set('@polymath/storage/selected-backend', 'mmkv');
    const mmkv = createMMKVModule(new Map([['current', 'mmkv-value']]));
    const adapter = await selectNativeStorageAdapter({
      useMMKV: false,
      loadMMKV: async () => mmkv,
    });

    expect(adapter).toBeInstanceOf(MMKVStorageAdapter);
    await expect(
      selectNativeStorageAdapter({
        useMMKV: false,
        loadMMKV: async () => {
          throw new Error('native unavailable');
        },
      }),
    ).rejects.toThrow('native unavailable');
  });

  it('retries a partial migration from the marked AsyncStorage authority by replacing stale MMKV keys', async () => {
    values.set('@polymath/storage/selected-backend', 'async-storage');
    values.set('current', 'new-async-value');
    const module = createMMKVModule(new Map([['current', 'partial-old-value']]));

    const adapter = await selectNativeStorageAdapter({
      useMMKV: true,
      loadMMKV: async () => module,
    });

    expect(adapter).toBeInstanceOf(MMKVStorageAdapter);
    expect(module.values.get('current')).toBe('new-async-value');
    expect(values.get('@polymath/storage/selected-backend')).toBe('mmkv');
  });

  it('does not switch to an existing MMKV store if migration cannot complete', async () => {
    values.set('source', 'preserved');
    const module = createMMKVModule(new Map([['already', 'native']]));
    vi.mocked(module.createMMKV).mockReturnValueOnce({
      ...module.createMMKV(),
      set: () => {
        throw new Error('native write failed');
      },
    } satisfies NativeKeyValueStore);

    await expect(
      selectNativeStorageAdapter({ useMMKV: true, loadMMKV: async () => module }),
    ).rejects.toThrow('native write failed');
    expect(values.get('source')).toBe('preserved');
    expect(values.has('@polymath/storage/selected-backend')).toBe(false);
  });

  it('records AsyncStorage authority after a first-copy failure for safe retry', async () => {
    values.set('source', 'original');
    const first = createMMKVModule();
    const created = first.createMMKV();
    vi.mocked(first.createMMKV).mockReturnValueOnce({
      ...created,
      set: () => {
        throw new Error('native write failed');
      },
    } satisfies NativeKeyValueStore);

    const fallback = await selectNativeStorageAdapter({
      useMMKV: true,
      loadMMKV: async () => first,
    });
    expect(fallback).not.toBeInstanceOf(MMKVStorageAdapter);
    expect(values.get('@polymath/storage/selected-backend')).toBe('async-storage');

    values.set('source', 'newer-async-value');
    const retry = createMMKVModule(new Map([['source', 'partial-copy']]));
    const selected = await selectNativeStorageAdapter({
      useMMKV: true,
      loadMMKV: async () => retry,
    });
    expect(selected).toBeInstanceOf(MMKVStorageAdapter);
    expect(retry.values.get('source')).toBe('newer-async-value');
  });

  it('does not select MMKV unless the durable selection marker is written', async () => {
    values.set('source', 'preserved');
    setItem.mockImplementation(async (key, value) => {
      if (key === '@polymath/storage/selected-backend') {
        throw new Error('selection marker could not be saved');
      }
      values.set(key, value);
    });
    const module = createMMKVModule();

    await expect(
      selectNativeStorageAdapter({ useMMKV: true, loadMMKV: async () => module }),
    ).rejects.toThrow('selection marker could not be saved');
    expect(values.get('source')).toBe('preserved');
    expect(values.has('@polymath/storage/selected-backend')).toBe(false);
    expect(module.values.get('source')).toBe('preserved');
  });
});
