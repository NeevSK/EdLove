/**
 * Web-Storage-shaped key-value persistence (getItem/setItem/removeItem, sync or async), so logic
 * stays agnostic of MMKV, AsyncStorage and localStorage. The MMKV-shaped port is IStorage in
 * logic/interfaces/storage.port.ts.
 */
export interface KeyValueStorage {
  getItem(key: string): string | null | Promise<string | null>;
  setItem(key: string, value: string): void | Promise<void>;
  removeItem(key: string): void | Promise<void>;
}

export interface LocalOnlyKeyValueStorage extends KeyValueStorage {
  readonly isolation: 'local-only';
}
