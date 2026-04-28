import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import type { ICrypto } from '../../logic/interfaces/crypto.port';

export class NativeCryptoAdapter implements ICrypto {
  async digestStringAsync(algorithm: string, data: string): Promise<string> {
    return await Crypto.digestStringAsync(algorithm as Crypto.CryptoDigestAlgorithm, data);
  }

  getRandomBytes(byteCount: number): Uint8Array {
    return Crypto.getRandomBytes(byteCount);
  }

  async getItemAsync(key: string): Promise<string | null> {
    return await SecureStore.getItemAsync(key);
  }

  async setItemAsync(key: string, value: string, options?: any): Promise<void> {
    await SecureStore.setItemAsync(key, value, options);
  }

  async deleteItemAsync(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(key);
  }
}
