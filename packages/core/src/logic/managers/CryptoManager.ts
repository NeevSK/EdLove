import type { ICrypto } from '@repo/core/logic/interfaces/crypto.port';

class CryptoManager implements ICrypto {
  private adapter: ICrypto | null = null;

  registerAdapter(adapter: ICrypto) {
    this.adapter = adapter;
  }

  private getAdapter(): ICrypto {
    if (!this.adapter) {
      throw new Error('[CryptoManager] No adapter registered.');
    }
    return this.adapter;
  }

  async digestStringAsync(algorithm: string, data: string): Promise<string> {
    return this.getAdapter().digestStringAsync(algorithm, data);
  }

  getRandomBytes(byteCount: number): Uint8Array {
    return this.getAdapter().getRandomBytes(byteCount);
  }

  async getItemAsync(key: string): Promise<string | null> {
    return this.getAdapter().getItemAsync(key);
  }

  async setItemAsync(key: string, value: string, options?: any): Promise<void> {
    return this.getAdapter().setItemAsync(key, value, options);
  }

  async deleteItemAsync(key: string): Promise<void> {
    return this.getAdapter().deleteItemAsync(key);
  }
}

export const cryptoManager = new CryptoManager();
