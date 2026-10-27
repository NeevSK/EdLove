/**
 * IStorage Port
 * Defines the contract for Key-Value storage across the Polymath Platform.
 */
export interface IStorage {
  set: (key: string, value: string | boolean | number) => void;
  setAsync: (key: string, value: string | boolean | number) => Promise<void>;
  getString: (key: string) => string | undefined;
  getStringAsync: (key: string) => Promise<string | undefined>;
  getBoolean: (key: string) => boolean | undefined;
  getNumber: (key: string) => number | undefined;
  delete: (key: string) => void;
  deleteAsync: (key: string) => Promise<void>;
  clearAll: () => void;
  clearAllAsync: () => Promise<void>;
  contains: (key: string) => boolean;
  subscribe?: (key: string, listener: () => void) => () => void;
}
