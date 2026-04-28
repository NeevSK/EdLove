import type { IStorage } from '../../logic/interfaces/storage.port';

/**
 * High-performance MMKV adapter using NitroModules/JSI.
 */
export class MMKVStorageAdapter implements IStorage {
  constructor(private mmkv: any) {}

  set(key: string, value: string | boolean | number) {
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
    this.mmkv.delete(key);
  }

  clearAll() {
    this.mmkv.clearAll();
  }

  contains(key: string) {
    return this.mmkv.contains(key);
  }
}
