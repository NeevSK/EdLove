import './setup';
import crypto from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { Hono } from 'hono';
import {
  createAdRewardRoutes,
  extractContentToVerify,
  verifyAdMobSignature,
  type AdMobKeyRecord,
} from '../core/routes/adRewards';

describe('AdRewards API & SSV Hardening', () => {
  // Generate a test EC keypair (NIST P-256) matching Google's ECDSA algorithm
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
    namedCurve: 'prime256v1',
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });

  const testKeyRecord: AdMobKeyRecord = {
    keyId: '12345678',
    pem: publicKey,
    base64: Buffer.from(publicKey).toString('base64'),
  };

  const mockKeyFetcher = async () => [testKeyRecord];

  function createTestApp(userContext?: { id: string; role?: string }) {
    const app = new Hono();
    app.use('*', async (c, next) => {
      if (userContext) {
        (c.set as any)('user', userContext);
      }
      await next();
    });
    app.route('/api', createAdRewardRoutes(() => undefined, mockKeyFetcher));
    return app;
  }

  describe('AdMob SSV Cryptographic Verification (/api/rewards/admob-ssv)', () => {
    it('rejects callbacks missing transaction_id or user_id with 400', async () => {
      const app = createTestApp();
      const res = await app.request('/api/rewards/admob-ssv?transaction_id=tx1');
      expect(res.status).toBe(400);
      expect(await res.text()).toContain('Missing transaction_id or user_id');
    });

    it('rejects callbacks missing signature or key_id with 400', async () => {
      const app = createTestApp();
      const res = await app.request(
        '/api/rewards/admob-ssv?transaction_id=tx1&user_id=u1&reward_amount=10',
      );
      expect(res.status).toBe(400);
      expect(await res.text()).toContain('Missing signature or key_id');
    });

    it('rejects callbacks with an unknown key_id with 400', async () => {
      const app = createTestApp();
      const res = await app.request(
        '/api/rewards/admob-ssv?transaction_id=tx1&user_id=u1&signature=dummy&key_id=9999999',
      );
      expect(res.status).toBe(400);
      expect(await res.text()).toContain('Unknown or missing key_id');
    });

    it('rejects callbacks with a tampered or invalid cryptographic signature with 400', async () => {
      const app = createTestApp();
      const res = await app.request(
        '/api/rewards/admob-ssv?transaction_id=tx1&user_id=u1&reward_amount=10&signature=MEQCIDInvalidSig123&key_id=12345678',
      );
      expect(res.status).toBe(400);
      expect(await res.text()).toContain('Cryptographic signature verification failed');
    });

    it('accepts and verifies a genuine ECDSA SHA-256 signed AdMob callback with 200 OK', async () => {
      const app = createTestApp();
      const rawQueryBase = 'ad_unit=1234&reward_amount=10&reward_item=energy&transaction_id=tx_valid_1&user_id=u_winner';

      // Sign rawQueryBase using our private EC key
      const signer = crypto.createSign('SHA256');
      signer.update(rawQueryBase, 'utf8');
      const signatureB64 = signer.sign(privateKey, 'base64');

      const fullUrl = `/api/rewards/admob-ssv?${rawQueryBase}&signature=${encodeURIComponent(signatureB64)}&key_id=12345678`;
      const res = await app.request(fullUrl);
      expect(res.status).toBe(200);
      expect(await res.text()).toBe('OK');
    });
  });

  describe('User Energy Balance Authorization (/api/rewards/energy-balance)', () => {
    it('rejects unauthenticated requests with 401', async () => {
      const app = createTestApp(); // No user in context
      const res = await app.request('/api/rewards/energy-balance?user_id=u1');
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toContain('Unauthorized');
    });

    it('forbids normal users from querying another user balance with 403', async () => {
      const app = createTestApp({ id: 'user_alice', role: 'student' });
      const res = await app.request('/api/rewards/energy-balance?user_id=user_bob');
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error).toContain('Forbidden');
    });

    it('allows an authenticated user to query their own energy balance with 200 OK', async () => {
      const app = createTestApp({ id: 'user_alice', role: 'student' });
      const res = await app.request('/api/rewards/energy-balance?user_id=user_alice');
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.userId).toBe('user_alice');
      expect(json).toHaveProperty('balance');
      expect(json).toHaveProperty('dailyQuotaRemaining');
      expect(json.dailyQuotaMax).toBe(10);
    });

    it('allows an admin user to query any user balance with 200 OK', async () => {
      const app = createTestApp({ id: 'admin_1', role: 'admin' });
      const res = await app.request('/api/rewards/energy-balance?user_id=user_bob');
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.userId).toBe('user_bob');
    });
  });
});
