/**
 * IStorage Port
 * Defines the contract for Key-Value storage across the Polymath Platform.
 */
export interface IStorage {
  set: (key: string, value: string | boolean | number) => void;
  getString: (key: string) => string | undefined;
  getStringAsync: (key: string) => Promise<string | undefined>;
  getBoolean: (key: string) => boolean | undefined;
  getNumber: (key: string) => number | undefined;
  delete: (key: string) => void;
  clearAll: () => void;
  contains: (key: string) => boolean;
}
