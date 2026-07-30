import type { ICrypto } from '@repo/core/logic/interfaces/crypto.port';

function toUint8Array(buffer: ArrayBuffer): Uint8Array {
  return new Uint8Array(buffer);
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function digestSha256(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const digest = await globalThis.crypto.subtle.digest('SHA-256', encoder.encode(data));
  return toHex(toUint8Array(digest));
}

export class WebCryptoAdapter implements ICrypto {
  async digestStringAsync(algorithm: string, data: string): Promise<string> {
    if (algorithm.toUpperCase() !== 'SHA-256') {
      throw new Error(`WebCryptoAdapter only supports SHA-256, got ${algorithm}`);
    }
    return digestSha256(data);
  }

  getRandomBytes(byteCount: number): Uint8Array {
    const bytes = new Uint8Array(byteCount);
    globalThis.crypto.getRandomValues(bytes);
    return bytes;
  }

  async getItemAsync(key: string): Promise<string | null> {
    return globalThis.localStorage.getItem(key);
  }

  async setItemAsync(key: string, value: string): Promise<void> {
    globalThis.localStorage.setItem(key, value);
  }

  async deleteItemAsync(key: string): Promise<void> {
    globalThis.localStorage.removeItem(key);
  }
}
