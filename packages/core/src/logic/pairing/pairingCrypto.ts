import crypto from 'isomorphic-webcrypto';

export interface EncryptedPairingEnvelope {
  ivHex: string;
  cipherTextHex: string;
}

function bufferToHex(buffer: ArrayBuffer | Uint8Array): string {
  const arr = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return buffer;
}

/**
 * Generates an ephemeral 256-bit cryptographically random pairing key.
 * This key is embedded in the QR code and never transmitted to the database.
 */
export function generatePairingKey(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return bufferToHex(bytes);
}

async function importAesKey(keyHex: string, usage: 'encrypt' | 'decrypt'): Promise<CryptoKey> {
  const rawKey = hexToBuffer(keyHex);
  return await crypto.subtle.importKey(
    'raw',
    toArrayBuffer(rawKey),
    { name: 'AES-GCM', length: 256 },
    false,
    [usage],
  );
}

/**
 * Encrypts an arbitrary payload (such as session tokens) using AES-GCM 256 with the ephemeral pairing key.
 */
export async function encryptPairingPayload(
  payload: Record<string, unknown>,
  keyHex: string,
): Promise<EncryptedPairingEnvelope> {
  const key = await importAesKey(keyHex, 'encrypt');
  const iv = new Uint8Array(12);
  crypto.getRandomValues(iv);

  const encoder = new TextEncoder();
  const plaintextBuffer = encoder.encode(JSON.stringify(payload));

  const cipherTextBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: toArrayBuffer(iv),
    },
    key,
    toArrayBuffer(plaintextBuffer),
  );

  return {
    ivHex: bufferToHex(iv),
    cipherTextHex: bufferToHex(cipherTextBuffer),
  };
}

/**
 * Decrypts a pairing payload received from the relay using the ephemeral pairing key.
 */
export async function decryptPairingPayload<T = unknown>(
  envelope: EncryptedPairingEnvelope,
  keyHex: string,
): Promise<T> {
  const key = await importAesKey(keyHex, 'decrypt');
  const iv = hexToBuffer(envelope.ivHex);
  const cipherText = hexToBuffer(envelope.cipherTextHex);

  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: toArrayBuffer(iv),
    },
    key,
    toArrayBuffer(cipherText),
  );

  const decoder = new TextDecoder();
  return JSON.parse(decoder.decode(decryptedBuffer)) as T;
}
