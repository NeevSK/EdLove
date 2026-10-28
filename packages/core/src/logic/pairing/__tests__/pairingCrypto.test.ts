import { describe, expect, it } from 'vitest';
import {
  decryptPairingPayload,
  encryptPairingPayload,
  generatePairingKey,
} from '../pairingCrypto';

describe('pairingCrypto', () => {
  it('generates a 64-character (32-byte) hex pairing key', () => {
    const key = generatePairingKey();
    expect(key).toBeTypeOf('string');
    expect(key).toHaveLength(64);
    expect(/^[0-9a-f]{64}$/.test(key)).toBe(true);
  });

  it('generates distinct keys on subsequent invocations', () => {
    const key1 = generatePairingKey();
    const key2 = generatePairingKey();
    expect(key1).not.toBe(key2);
  });

  it('encrypts and decrypts a session payload successfully', async () => {
    const key = generatePairingKey();
    const payload = {
      access_token: 'secret_jwt_access_token_123',
      refresh_token: 'secret_refresh_token_456',
      user_id: '99999999-9999-9999-9999-999999999999',
    };

    const envelope = await encryptPairingPayload(payload, key);
    expect(envelope.ivHex).toHaveLength(24); // 12 bytes = 24 hex chars
    expect(envelope.cipherTextHex.length).toBeGreaterThan(32);

    const decrypted = await decryptPairingPayload<typeof payload>(envelope, key);
    expect(decrypted).toEqual(payload);
  });

  it('fails to decrypt if the key does not match', async () => {
    const key1 = generatePairingKey();
    const key2 = generatePairingKey();
    const payload = { secret: 'data' };

    const envelope = await encryptPairingPayload(payload, key1);
    await expect(decryptPairingPayload(envelope, key2)).rejects.toThrow();
  });

  it('fails to decrypt if ciphertext is tampered', async () => {
    const key = generatePairingKey();
    const payload = { secret: 'data' };

    const envelope = await encryptPairingPayload(payload, key);
    // Tamper with one character of the ciphertext
    const tamperedHex =
      envelope.cipherTextHex.slice(0, 10) +
      (envelope.cipherTextHex[10] === 'a' ? 'b' : 'a') +
      envelope.cipherTextHex.slice(11);

    await expect(
      decryptPairingPayload({ ...envelope, cipherTextHex: tamperedHex }, key),
    ).rejects.toThrow();
  });
});
