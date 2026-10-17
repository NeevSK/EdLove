import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { assertEnv } from '../load-env';
import { decryptKey, encryptKey } from '../ai/utils/crypto';

describe('Sanctuary Crypto & BYOK Invariants', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('successfully encrypts and decrypts with a valid 32-byte secret', () => {
    process.env.BYOK_ENCRYPTION_SECRET = '12345678901234567890123456789012'; // 32 chars
    const plainText = 'sk-or-v1-my-secret-agent-key';

    const encrypted = encryptKey(plainText);
    expect(encrypted).toBeDefined();
    expect(encrypted).toContain(':');

    const decrypted = decryptKey(encrypted);
    expect(decrypted).toBe(plainText);
  });

  it('fails fast when BYOK_ENCRYPTION_SECRET is unset or shorter than 32 characters', () => {
    delete process.env.BYOK_ENCRYPTION_SECRET;
    expect(() => encryptKey('secret')).toThrow(
      'BYOK_ENCRYPTION_SECRET must be at least 32 characters before encrypting keys',
    );

    process.env.BYOK_ENCRYPTION_SECRET = 'too-short-secret';
    expect(() => encryptKey('secret')).toThrow(
      'BYOK_ENCRYPTION_SECRET must be at least 32 characters before encrypting keys',
    );
  });

  it('assertEnv throws in production if BYOK_ENCRYPTION_SECRET is missing or insufficient', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.BYOK_ENCRYPTION_SECRET;

    expect(() => assertEnv()).toThrow(
      '[FATAL] BYOK_ENCRYPTION_SECRET must be provided and be at least 32 characters in staging/production.',
    );

    process.env.BYOK_ENCRYPTION_SECRET = 'short';
    expect(() => assertEnv()).toThrow(
      '[FATAL] BYOK_ENCRYPTION_SECRET must be provided and be at least 32 characters in staging/production.',
    );

    process.env.BYOK_ENCRYPTION_SECRET = '12345678901234567890123456789012';
    expect(() => assertEnv()).not.toThrow();
  });
});
