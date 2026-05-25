import crypto from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { clearJwkCache, setTestPublicKey, verifySupabaseJwt } from '../jwt';

describe('Asymmetric JWT Verification Engine', () => {
  let rsaPrivateKey: crypto.KeyObject;
  let rsaPublicKey: crypto.KeyObject;
  let ecPrivateKey: crypto.KeyObject;
  let ecPublicKey: crypto.KeyObject;

  const kidRsa = 'test-rsa-key-id';
  const kidEc = 'test-ec-key-id';

  beforeEach(() => {
    clearJwkCache();

    // Generate test RSA Key Pair (RS256)
    const rsaKeys = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
    });
    rsaPrivateKey = rsaKeys.privateKey;
    rsaPublicKey = rsaKeys.publicKey;

    // Generate test EC Key Pair (ES256 - prime256v1 curve)
    const ecKeys = crypto.generateKeyPairSync('ec', {
      namedCurve: 'prime256v1',
    });
    ecPrivateKey = ecKeys.privateKey;
    ecPublicKey = ecKeys.publicKey;
  });

  afterEach(() => {
    delete process.env.SUPABASE_JWT_PUBLIC_KEY;
    clearJwkCache();
  });

  function signToken(
    payload: any,
    privateKey: crypto.KeyObject,
    kid: string,
    alg = 'RS256',
  ): string {
    const header = {
      alg,
      typ: 'JWT',
      kid,
    };
    const headerB64 = Buffer.from(JSON.stringify(header)).toString('base64url');
    const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const data = `${headerB64}.${payloadB64}`;

    const signOptions: any = {};
    if (alg === 'ES256') {
      signOptions.dsaEncoding = 'ieee-p1363';
    }

    const signature = crypto.sign('sha256', Buffer.from(data), {
      key: privateKey,
      ...signOptions,
    });
    const signatureB64 = signature.toString('base64url');
    return `${data}.${signatureB64}`;
  }

  it('should successfully verify a valid RS256 token using cached key', async () => {
    setTestPublicKey(kidRsa, rsaPublicKey);

    const payload = {
      sub: 'user-uuid-1234',
      email: 'citizen@sanctuary.io',
      role: 'authenticated',
      exp: Math.floor(Date.now() / 1000) + 3600,
    };

    const token = signToken(payload, rsaPrivateKey, kidRsa, 'RS256');
    const verified = await verifySupabaseJwt(token);

    expect(verified).not.toBeNull();
    expect(verified!.sub).toBe('user-uuid-1234');
    expect(verified!.email).toBe('citizen@sanctuary.io');
  });

  it('should successfully verify a valid ES256 token using cached key', async () => {
    setTestPublicKey(kidEc, ecPublicKey);

    const payload = {
      sub: 'user-ec-5678',
      email: 'ec-citizen@sanctuary.io',
      role: 'authenticated',
      exp: Math.floor(Date.now() / 1000) + 3600,
    };

    const token = signToken(payload, ecPrivateKey, kidEc, 'ES256');
    const verified = await verifySupabaseJwt(token);

    expect(verified).not.toBeNull();
    expect(verified!.sub).toBe('user-ec-5678');
    expect(verified!.email).toBe('ec-citizen@sanctuary.io');
  });

  it('should reject tokens signed with an unsupported algorithm (e.g. HS256 / Symmetric)', async () => {
    setTestPublicKey(kidRsa, rsaPublicKey);

    const payload = {
      sub: 'user-123',
      exp: Math.floor(Date.now() / 1000) + 3600,
    };

    const token = signToken(payload, rsaPrivateKey, kidRsa, 'HS256');
    const verified = await verifySupabaseJwt(token);

    expect(verified).toBeNull();
  });

  it('should reject expired tokens', async () => {
    setTestPublicKey(kidRsa, rsaPublicKey);

    const payload = {
      sub: 'user-123',
      exp: Math.floor(Date.now() / 1000) - 10, // Expired 10 seconds ago
    };

    const token = signToken(payload, rsaPrivateKey, kidRsa, 'RS256');
    const verified = await verifySupabaseJwt(token);

    expect(verified).toBeNull();
  });

  it('should reject pre-active tokens (nbf in future)', async () => {
    setTestPublicKey(kidRsa, rsaPublicKey);

    const payload = {
      sub: 'user-123',
      exp: Math.floor(Date.now() / 1000) + 3600,
      nbf: Math.floor(Date.now() / 1000) + 60, // Active in 60 seconds
    };

    const token = signToken(payload, rsaPrivateKey, kidRsa, 'RS256');
    const verified = await verifySupabaseJwt(token);

    expect(verified).toBeNull();
  });

  it('should reject tokens with modified/tampered signatures', async () => {
    setTestPublicKey(kidRsa, rsaPublicKey);

    const payload = {
      sub: 'user-123',
      exp: Math.floor(Date.now() / 1000) + 3600,
    };

    const token = signToken(payload, rsaPrivateKey, kidRsa, 'RS256');
    const tamperedToken = `${token.slice(0, -5)}AAAAA`; // Corrupt signature
    const verified = await verifySupabaseJwt(tamperedToken);

    expect(verified).toBeNull();
  });

  it('should fallback to SUPABASE_JWT_PUBLIC_KEY env variable override', async () => {
    // Export public key in PEM format to env
    const pemKey = rsaPublicKey.export({ format: 'pem', type: 'pkcs1' }) as string;
    process.env.SUPABASE_JWT_PUBLIC_KEY = pemKey;

    const payload = {
      sub: 'user-env-override',
      exp: Math.floor(Date.now() / 1000) + 3600,
    };

    const token = signToken(payload, rsaPrivateKey, kidRsa, 'RS256');
    const verified = await verifySupabaseJwt(token);

    expect(verified).not.toBeNull();
    expect(verified!.sub).toBe('user-env-override');
  });

  it('should support integration test token bypass for local/test environments', async () => {
    process.env.NODE_ENV = 'test';
    const verifiedAdmin = await verifySupabaseJwt('admin-user-1');
    const verifiedStudent = await verifySupabaseJwt('student-user-1');

    expect(verifiedAdmin).not.toBeNull();
    expect(verifiedAdmin!.sub).toBe('admin-user-1');
    expect(verifiedStudent!.sub).toBe('student-user-1');
  });
});
