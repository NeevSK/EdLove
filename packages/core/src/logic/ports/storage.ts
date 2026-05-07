/**
 * IStorage
 * Abstract interface for key-value persistence.
 * Allows logic layer to remain agnostic of MMKV/AsyncStorage/WebStorage.
 */
export interface IStorage {
  getItem(key: string): string | null | Promise<string | null>;
  setItem(key: string, value: string): void | Promise<void>;
  removeItem(key: string): void | Promise<void>;
}
