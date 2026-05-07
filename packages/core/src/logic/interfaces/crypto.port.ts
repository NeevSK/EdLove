/**
 * ICrypto Port
 * Defines the contract for cryptographic operations and secure persistent storage.
 */
export interface ICrypto {
  // Hash & Derivation
  digestStringAsync: (algorithm: string, data: string) => Promise<string>;
  getRandomBytes: (byteCount: number) => Uint8Array;

  // Secure Storage
  getItemAsync: (key: string) => Promise<string | null>;
  setItemAsync: (key: string, value: string, options?: any) => Promise<void>;
  deleteItemAsync: (key: string) => Promise<void>;
}
