import { AsyncStorageAdapter } from '@repo/core/adapters/native/AsyncStorageAdapter';
import {
  MMKVStorageAdapter,
  type NativeKeyValueStore,
} from '@repo/core/adapters/native/MMKVStorageAdapter';
import type { IStorage } from '@repo/core/logic/interfaces/storage.port';

const MMKV_INSTANCE_ID = 'gurudevi-store';
const SELECTED_BACKEND_KEY = '@polymath/storage/selected-backend';
const ASYNC_STORAGE_BACKEND = 'async-storage';
const MMKV_BACKEND = 'mmkv';

interface MMKVModule {
  createMMKV: (configuration: { id: string }) => NativeKeyValueStore;
  existsMMKV: (id: string) => boolean;
}

/** Select one native backend for the process and migrate before changing authority. */
export async function selectNativeStorageAdapter(input: {
  readonly useMMKV: boolean;
  readonly loadMMKV: () => Promise<MMKVModule>;
}): Promise<IStorage> {
  const asyncStorage = new AsyncStorageAdapter();
  const selectedBackend = await asyncStorage.getStringAsync(SELECTED_BACKEND_KEY);
  if (
    selectedBackend !== undefined &&
    selectedBackend !== ASYNC_STORAGE_BACKEND &&
    selectedBackend !== MMKV_BACKEND
  ) {
    throw new Error(`Unknown selected storage backend: ${selectedBackend}`);
  }

  if (selectedBackend === MMKV_BACKEND) {
    const mmkvModule = await input.loadMMKV();
    if (!mmkvModule.existsMMKV(MMKV_INSTANCE_ID)) {
      throw new Error('Selected MMKV storage is unavailable; refusing to reopen stale AsyncStorage.');
    }
    return new MMKVStorageAdapter(mmkvModule.createMMKV({ id: MMKV_INSTANCE_ID }));
  }

  if (!input.useMMKV) return asyncStorage;

  let mmkvModule: MMKVModule;
  try {
    mmkvModule = await input.loadMMKV();
  } catch (error) {
    console.warn('Boot: MMKV is unavailable before selection; using AsyncStorage for this launch.', error);
    return asyncStorage;
  }

  const hadMMKVInstance = mmkvModule.existsMMKV(MMKV_INSTANCE_ID);
  let mmkv: NativeKeyValueStore;
  try {
    mmkv = mmkvModule.createMMKV({ id: MMKV_INSTANCE_ID });
  } catch (error) {
    if (hadMMKVInstance && selectedBackend !== ASYNC_STORAGE_BACKEND) throw error;
    console.warn('Boot: MMKV could not initialize; using AsyncStorage for this launch.', error);
    return asyncStorage;
  }

  try {
    await asyncStorage.migrateMissingKeysTo(
      mmkv,
      new Set([SELECTED_BACKEND_KEY]),
      selectedBackend === ASYNC_STORAGE_BACKEND,
    );
    await asyncStorage.setAsync(SELECTED_BACKEND_KEY, MMKV_BACKEND);
  } catch (error) {
    if (hadMMKVInstance && selectedBackend !== ASYNC_STORAGE_BACKEND) throw error;
    if (selectedBackend === undefined) {
      await asyncStorage.setAsync(SELECTED_BACKEND_KEY, ASYNC_STORAGE_BACKEND);
    }
    console.warn('Boot: MMKV migration did not complete; retaining AsyncStorage authority.', error);
    return asyncStorage;
  }

  return new MMKVStorageAdapter(mmkv);
}
