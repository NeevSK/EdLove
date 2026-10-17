import './setup';
import crypto from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { app } from '../core/app';
import { parseORPCContext } from '../core/router';
import { clearJwkCache, setTestPublicKey } from '../jwt';
import { createTestORPCClient } from './orpc-client';
import {
  getMockAuthIdentityLookup,
  resetMockAuthIdentities,
  setMockActiveBond,
  setMockAuthIdentity,
  setMockAuthIdentityError,
  setMockMoodLogs,
  setMockZenStackDbAvailable,
} from './setup';

const subject = '123e4567-e89b-12d3-a456-426614174010';
const accountId = '123e4567-e89b-12d3-a456-426614174020';

describe('canonical API account resolution (identity/database substituted)', () => {
  beforeEach(() => {
    resetMockAuthIdentities();
    setMockZenStackDbAvailable(true);
    setMockAuthIdentity(subject, accountId);
    setMockActiveBond({
      user_id: accountId,
      entity_id: 'school-123',
      entity_type: 'SCHOOL',
      capacity: 'teacher',
    });
    setMockMoodLogs([]);
  });
  afterEach(() => {
    resetMockAuthIdentities();
    clearJwkCache();
  });

  it('writes as the mapped application account rather than the verified provider subject', async () => {
    const result = await createTestORPCClient({ Authorization: `Bearer ${subject}` }).self.logMood({
      body: { user_id: accountId, mood_score: 5 },
    });
    expect(result.user_id).toBe(accountId);
    const lookup = getMockAuthIdentityLookup();
    expect(lookup?.parameters).toEqual([subject]);
    expect(lookup?.query).toContain("identity.provider = 'supabase'");
    expect(lookup?.query).toContain('account.deleted_at IS NULL');
  });

  it('rejects a missing mapping instead of falling back to the raw subject', async () => {
    setMockAuthIdentity(subject, null);
    await expect(
      createTestORPCClient({ Authorization: `Bearer ${subject}` }).self.getMoodHistory({
        query: {},
      }),
    ).rejects.toMatchObject({ status: 401 });
  });

  it('returns a safe dependency error for lookup failure', async () => {
    setMockAuthIdentityError(new Error('synthetic-private-database-password'));
    await expect(
      createTestORPCClient({ Authorization: `Bearer ${subject}` }).self.getMoodHistory({
        query: {},
      }),
    ).rejects.toMatchObject({ status: 503 });
  });

  it('rechecks a revoked mapping on the next request without trusting cached account identity', async () => {
    const client = createTestORPCClient({ Authorization: `Bearer ${subject}` });
    await expect(client.self.getMoodHistory({ query: {} })).resolves.toEqual([]);
    setMockAuthIdentity(subject, null);
    await expect(client.self.getMoodHistory({ query: {} })).rejects.toMatchObject({ status: 401 });
  });

  it('uses one account for two explicitly persisted provider-subject mappings', async () => {
    const linkedSubject = '123e4567-e89b-12d3-a456-426614174030';
    setMockAuthIdentity(linkedSubject, accountId);
    const first = await createTestORPCClient({ Authorization: `Bearer ${subject}` }).self.logMood({
      body: { user_id: accountId, mood_score: 4 },
    });
    const second = await createTestORPCClient({
      Authorization: `Bearer ${linkedSubject}`,
    }).self.logMood({
      body: { user_id: accountId, mood_score: 6 },
    });
    expect(first.user_id).toBe(accountId);
    expect(second.user_id).toBe(accountId);
  });

  it('does not let the raw provider subject select a different self-owned resource', async () => {
    await expect(
      createTestORPCClient({ Authorization: `Bearer ${subject}` }).self.logMood({
        body: { user_id: subject, mood_score: 5 },
      }),
    ).rejects.toMatchObject({ status: 403 });
  });

  it('resolves the same canonical account for the standalone context builder', async () => {
    const context = await parseORPCContext(
      new Request('http://test/api/self/getMoodHistory', {
        headers: { Authorization: `Bearer ${subject}` },
      }),
      { NODE_ENV: 'test' },
      'canonical-context',
    );
    expect(context.user.id).toBe(accountId);
    expect(context.principal.id).toBe(accountId);
  });

  it('keeps OpenAPI bound to the canonical account', async () => {
    const response = await app.request('/api/openapi/self/mood?limit=1', {
      headers: { Authorization: `Bearer ${subject}` },
    });
    expect(response.status).toBe(200);
    expect(getMockAuthIdentityLookup()?.parameters).toEqual([subject]);
  });

  it('accepts a locally signed phone-only JWT through the same account mapping', async () => {
    const keys = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
    const kid = 'canonical-phone-key';
    await setTestPublicKey(kid, keys.publicKey);
    const issuer = 'https://identity.example.test/auth/v1';
    const header = Buffer.from(JSON.stringify({ alg: 'RS256', kid })).toString('base64url');
    const payload = Buffer.from(
      JSON.stringify({
        sub: subject,
        phone: '+94770000001',
        iss: issuer,
        aud: 'authenticated',
        exp: Math.floor(Date.now() / 1000) + 60,
      }),
    ).toString('base64url');
    const data = `${header}.${payload}`;
    const signature = crypto
      .sign('sha256', Buffer.from(data), keys.privateKey)
      .toString('base64url');
    const response = await app.request(
      '/api/openapi/self/mood?limit=1',
      {
        headers: { Authorization: `Bearer ${data}.${signature}` },
      },
      {
        NODE_ENV: 'production',
        SUPABASE_JWT_ISSUER: issuer,
        SUPABASE_JWT_AUDIENCE: 'authenticated',
      },
    );
    expect(response.status).toBe(200);
    expect(getMockAuthIdentityLookup()?.parameters).toEqual([subject]);
  });
});
