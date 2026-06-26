import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a standard idempotency key for sovereign operations.
 * Use this to ensure that retried requests do not create duplicate records.
 */
export const generateIdempotencyKey = (prefix?: string) => {
  const uuid = uuidv4();
  return prefix ? `${prefix}_${uuid}` : uuid;
};

/**
 * Returns a consistent, reproducible idempotency key for any data payload.
 * Uses SHA-256 to hash the serialized JSON content.
 */
export const getConsistentIdempotencyKey = async (data: any): Promise<string> => {
  const content = JSON.stringify(data);
  try {
    if (typeof globalThis !== 'undefined' && globalThis.crypto?.subtle) {
      const msgUint8 = new TextEncoder().encode(content);
      const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (e) {
    console.warn('[Idempotency] Crypto hash failed, falling back to basic hash', e);
  }
  // Fallback basic hash
  let hash = 5381;
  for (let i = 0; i < content.length; i++) {
    hash = (hash * 33) ^ content.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
};
