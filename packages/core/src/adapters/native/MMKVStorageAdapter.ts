import type { IStorage } from '@repo/core/logic/interfaces/storage.port';
import type { MMKV } from 'react-native-mmkv';

/** Native storage methods the platform adapter consumes. */
export type NativeKeyValueStore = Pick<
  MMKV,
  'set' | 'getString' | 'getBoolean' | 'getNumber' | 'remove' | 'clearAll' | 'contains'
>;

/**
 * High-performance MMKV adapter using NitroModules/JSI.
 */
export class MMKVStorageAdapter implements IStorage {
  constructor(private readonly mmkv: NativeKeyValueStore) {}

  set(key: string, value: string | boolean | number) {
    this.mmkv.set(key, value);
  }

  async setAsync(key: string, value: string | boolean | number) {
    this.mmkv.set(key, value);
  }

  getString(key: string) {
    return this.mmkv.getString(key);
  }

  async getStringAsync(key: string) {
    return this.mmkv.getString(key);
  }

  getBoolean(key: string) {
    return this.mmkv.getBoolean(key);
  }

  getNumber(key: string) {
    return this.mmkv.getNumber(key);
  }

  delete(key: string) {
    this.mmkv.remove(key);
  }

  async deleteAsync(key: string) {
    this.mmkv.remove(key);
  }

  clearAll() {
    this.mmkv.clearAll();
  }

  async clearAllAsync() {
    this.mmkv.clearAll();
  }

  contains(key: string) {
    return this.mmkv.contains(key);
  }
}
