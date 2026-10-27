import { Hono } from 'hono';
import { timing } from 'hono/timing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { app as sanctuary } from '../core/app';
import { createIdentityBridge } from '../core/middleware/identityBridge';
import type { AuthenticatedUser, AuthProviderPort } from '../core/ports/AuthProviderPort';
import type { DatabaseProviderPort } from '../core/ports/DatabaseProviderPort';

const binding = vi.hoisted(() => vi.fn());
vi.mock('../core/authenticatedAccount', () => ({ resolveAuthenticatedAccount: binding }));

const subject = 'f0560000-0000-4000-8000-000000000001';
const account = '123e4567-e89b-8101-8100-426614174000';
const verifier = vi.fn<AuthProviderPort['verifyToken']>();
const authProvider: AuthProviderPort = { providerName: 'fixture', verifyToken: verifier };
const databaseProvider: DatabaseProviderPort = {
  providerName: 'fixture',
  canConnect: () => false,
  getClient: () => null,
};

function app() {
  const router = new Hono<{ Variables: { user: AuthenticatedUser } }>();
  router.use(timing());
  router.use('*', createIdentityBridge({ authProvider, databaseProvider }));
  router.get('/probe', (context) => context.json({ id: context.get('user').id }));
  return router;
}

beforeEach(() => {
  verifier.mockReset().mockResolvedValue({ sub: subject, provider: 'supabase' });
  binding.mockReset().mockResolvedValue({ id: account });
});

describe('G1 verified credential subject assertion / substituted verifier and account database', () => {
  it.each([
    { asserted: subject, status: 200 },
    { asserted: 'other-subject', status: 401 },
    { asserted: account, status: 401 },
    { asserted: '', status: 401 },
  ])(
    'compares $asserted to the verified subject, resulting in HTTP $status',
    async ({ asserted, status }) => {
      const response = await app().request('https://api.example.invalid/probe', {
        headers: { Authorization: 'Bearer synthetic', 'X-Expected-Auth-Subject': asserted },
      });
      expect(response.status).toBe(status);
      if (status === 200) {
        expect(await response.json()).toEqual({ id: account });
        expect(binding).toHaveBeenCalledWith(subject, undefined, 'supabase');
      } else {
        expect(binding).not.toHaveBeenCalled();
      }
    },
  );

  it('requires credentials when a subject assertion is supplied', async () => {
    const response = await app().request('https://api.example.invalid/probe', {
      headers: { 'X-Expected-Auth-Subject': subject },
    });
    expect(response.status).toBe(401);
    expect(verifier).not.toHaveBeenCalled();
    expect(binding).not.toHaveBeenCalled();
  });

  it('preserves authenticated canonical resolution without the optional assertion', async () => {
    const response = await app().request('https://api.example.invalid/probe', {
      headers: { Authorization: 'Bearer synthetic' },
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ id: account });
  });

  it('does not turn an assertion into authority when credential verification fails', async () => {
    verifier.mockResolvedValueOnce(null);
    const response = await app().request('https://api.example.invalid/probe', {
      headers: { Authorization: 'Bearer invalid', 'X-Expected-Auth-Subject': subject },
    });
    expect(response.status).toBe(401);
    expect(binding).not.toHaveBeenCalled();
  });

  it.each(['http://localhost:8081', 'http://localhost:3000'])(
    'allows the real mutation transport headers for admitted origin %s',
    async (origin) => {
      const response = await sanctuary.request(
        'https://api.example.invalid/api/identity/resolveIdentity',
        {
          method: 'OPTIONS',
          headers: {
            Origin: origin,
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers':
              'authorization,x-expected-auth-subject,idempotency-key,x-idempotency-key,x-pqc-kem,x-sovereign-epoch,x-poa-sig',
          },
        },
      );
      expect(response.status).toBe(204);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe(origin);
      expect(response.headers.get('Access-Control-Allow-Headers')?.toLowerCase()).toContain(
        'x-expected-auth-subject',
      );
      const allowed = response.headers
        .get('Access-Control-Allow-Headers')
        ?.toLowerCase()
        .split(',');
      for (const header of [
        'idempotency-key',
        'x-idempotency-key',
        'x-pqc-kem',
        'x-sovereign-epoch',
        'x-poa-sig',
      ])
        expect(allowed).toContain(header);
    },
  );
});
