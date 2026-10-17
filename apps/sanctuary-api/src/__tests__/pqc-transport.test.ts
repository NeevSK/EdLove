import { Hono } from 'hono';
import { randomBytes } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { createPqcMiddleware } from '../core/middleware/pqcMiddleware';
import {
  computePayloadDigest,
  createPoaHeader,
  deriveHybridKey,
  sealPqcPayload,
  unsealPqcPayload,
  verifyPoaHeader,
} from '../core/security/pqc';

describe('Post-Quantum Cryptography & Zero-Trust PoA Engine', () => {
  const secretKey = 'sovereign-test-poa-key-32-chars!!';

  describe('Hybrid Key Derivation & Sealing', () => {
    it('derives 32-byte AES keys using HKDF-SHA256 from hybrid secrets', () => {
      const classical = randomBytes(32);
      const quantum = randomBytes(32);
      const key1 = deriveHybridKey(classical, quantum);
      const key2 = deriveHybridKey(classical, quantum);

      expect(key1.length).toBe(32);
      expect(key1).toEqual(key2); // Deterministic
    });

    it('seals and unseals arbitrary JSON payloads in a quantum-resistant envelope', async () => {
      const original = { studentId: 'student-99', reflection: 'Holistic deep learning inquiry' };
      const sharedKey = deriveHybridKey(randomBytes(32), randomBytes(32));

      const sealed = await sealPqcPayload(original, sharedKey);
      expect(sealed.v).toBe('pqc-v1');
      expect(sealed.kem).toBeDefined();
      expect(sealed.iv).toBeDefined();
      expect(sealed.tag).toBeDefined();
      expect(sealed.ct).toBeDefined();

      const unsealed = await unsealPqcPayload<typeof original>(sealed, sharedKey);
      expect(unsealed).toEqual(original);
    });

    it('rejects unsealing when epoch is expired (anti-replay)', async () => {
      const original = { sensitive: true };
      const sharedKey = deriveHybridKey(randomBytes(32), randomBytes(32));
      const sealed = await sealPqcPayload(original, sharedKey);

      // Mutate epoch to simulate a 2-hour-old replayed packet
      sealed.epoch = Date.now() - 2 * 60 * 60 * 1000;

      await expect(unsealPqcPayload(sealed, sharedKey)).rejects.toThrow(/Replay detected/);
    });
  });

  describe('Proof-of-Authority (PoA) Attestation', () => {
    const payload = JSON.stringify({ message: 'Authoritative transaction' });
    const digest = computePayloadDigest(payload);

    it('signs and verifies valid PoA hardware attestation headers', () => {
      const header = createPoaHeader('device-mac-node-01', payload, secretKey);
      expect(header).toMatch(/^poa-v1 device-mac-node-01:\d+:[A-Za-z0-9_-]+$/);

      const attestation = verifyPoaHeader(header, digest, secretKey);
      expect(attestation).not.toBeNull();
      expect(attestation?.authorityId).toBe('device-mac-node-01');
      expect(attestation?.digest).toBe(digest);
    });

    it('rejects tampered payload digests', () => {
      const header = createPoaHeader('device-mac-node-01', payload, secretKey);
      const tamperedDigest = computePayloadDigest('tampered payload content');

      const attestation = verifyPoaHeader(header, tamperedDigest, secretKey);
      expect(attestation).toBeNull();
    });

    it('rejects signatures from unauthorized keys', () => {
      const header = createPoaHeader('device-mac-node-01', payload, 'wrong-secret-key');
      const attestation = verifyPoaHeader(header, digest, secretKey);
      expect(attestation).toBeNull();
    });
  });

  describe('Hono PQC & PoA Middleware Integration', () => {
    function createTestApp() {
      const app = new Hono<{ Variables: { pqcVerified: boolean; poaAuthority: string } }>();
      app.use('/api/*', createPqcMiddleware({ secretKey }));
      app.post('/api/secure-data', async (c) => {
        const isPqc = c.get('pqcVerified');
        const authority = c.get('poaAuthority') || 'none';
        return c.json({ ok: true, isPqc, authority });
      });
      return app;
    }

    it('passes standard requests without PQC headers without error', async () => {
      const app = createTestApp();
      const res = await app.request('/api/secure-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: 123 }),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.isPqc).toBe(false);
      expect(json.authority).toBe('none');
    });

    it('detects x-pqc-kem header and injects hybrid-verified response headers', async () => {
      const app = createTestApp();
      const res = await app.request('/api/secure-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-pqc-kem': 'mock-ml-kem-ciphertext-base64',
        },
        body: JSON.stringify({ test: 123 }),
      });

      expect(res.status).toBe(200);
      expect(res.headers.get('x-pqc-status')).toBe('hybrid-verified');
      expect(res.headers.get('x-pqc-kem-ack')).toBe('accepted');
      const json = await res.json();
      expect(json.isPqc).toBe(true);
    });

    it('validates x-poa-sig header and populates poaAuthority context', async () => {
      const app = createTestApp();
      const body = JSON.stringify({ action: 'authoritative_command' });
      const poaHeader = createPoaHeader('node-authority-alpha', body, secretKey);

      const res = await app.request('/api/secure-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-poa-sig': poaHeader,
        },
        body,
      });

      expect(res.status).toBe(200);
      expect(res.headers.get('x-poa-status')).toBe('attested');
      const json = await res.json();
      expect(json.authority).toBe('node-authority-alpha');
    });

    it('rejects replayed requests with clock drift outside allowable tolerance', async () => {
      const app = createTestApp();
      const oldEpoch = Date.now() - 60000; // 60 seconds ago (> 30s limit)

      const res = await app.request('/api/secure-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-sovereign-epoch': String(oldEpoch),
        },
        body: JSON.stringify({ test: 123 }),
      });

      expect(res.status).toBe(400);
    });
  });
});
