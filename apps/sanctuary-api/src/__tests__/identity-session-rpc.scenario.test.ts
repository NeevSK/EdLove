import { RPCHandler } from '@orpc/server/fetch';
import { SupabaseIdentityAdapter } from '@repo/core/adapters/supabaseIdentity.adapter';
import { Hono } from 'hono';
import { timing } from 'hono/timing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { identityRouter } from '../core/handlers/identity';
import { createIdentityBridge } from '../core/middleware/identityBridge';
import type { AuthenticatedUser, AuthProviderPort } from '../core/ports/AuthProviderPort';

const provider = vi.hoisted(() => ({ getSession: vi.fn(), getUser: vi.fn(), binding: vi.fn() }));
vi.mock('@repo/core/adapters/supabaseClient', () => ({
  supabaseClient: { auth: { getSession: provider.getSession, getUser: provider.getUser } },
}));
vi.mock('../core/authenticatedAccount', () => ({ resolveAuthenticatedAccount: provider.binding }));

const subjectA = 'f0560000-0000-4000-8000-000000000001';
const subjectB = 'f0560000-0000-4000-8000-000000000002';
const accountA = '123e4567-e89b-8101-8100-426614174001';
const accountB = '123e4567-e89b-8101-8100-426614174002';
const sessionA = {
  data: { session: { access_token: 'session-a', user: { id: subjectA } } },
  error: null,
};
const sessionB = {
  data: { session: { access_token: 'session-b', user: { id: subjectB } } },
  error: null,
};

const verify: AuthProviderPort['verifyToken'] = async (token) => {
  if (token === 'session-a') return { sub: subjectA, provider: 'supabase' };
  if (token === 'session-b') return { sub: subjectB, provider: 'supabase' };
  return null;
};

function rpcServer() {
  const router = new Hono<{ Variables: { user: AuthenticatedUser } }>();
  router.use(timing());
  router.use(
    '*',
    createIdentityBridge({
      authProvider: { providerName: 'fixture', verifyToken: verify },
      databaseProvider: { providerName: 'fixture', canConnect: () => false, getClient: () => null },
    }),
  );
  const handler = new RPCHandler({ identity: identityRouter });
  router.all('/api/*', async (context) => {
    const result = await handler.handle(context.req.raw, {
      prefix: '/api',
      context: { user: context.get('user'), requestId: 'continuity-fixture' },
    });
    return result.response ?? context.text('Not Found', 404);
  });
  return router;
}

beforeEach(() => {
  provider.getSession.mockReset().mockResolvedValue(sessionA);
  provider.getUser.mockReset();
  provider.binding.mockReset().mockImplementation(async (subject: string) => ({
    id: subject === subjectA ? accountA : accountB,
  }));
});
afterEach(() => {
  vi.unstubAllGlobals();
  expect(provider.getUser).not.toHaveBeenCalled();
});

describe('G2 identity continuity / actual oRPC client-handler and Hono, substituted SDK/verifier/database', () => {
  it('maps the captured provider subject to a distinct canonical UUIDv8 through the full RPC path', async () => {
    const server = rpcServer();
    const transport = vi.fn<typeof fetch>(async (input, init) =>
      server.fetch(new Request(input, init)),
    );
    vi.stubGlobal('fetch', transport);
    const identity = await new SupabaseIdentityAdapter().identifyActiveCitizen();
    expect(identity?.id).toBe(accountA);
    expect(provider.binding).toHaveBeenCalledWith(subjectA, undefined, 'supabase');
    expect(transport).toHaveBeenCalledOnce();
    const headers = new Headers(transport.mock.calls[0]?.[1]?.headers);
    expect(headers.get('X-Expected-Auth-Subject')).toBe(subjectA);
    expect(headers.get('Authorization')).toBe('Bearer session-a');
    expect(transport.mock.calls[0]?.[1]?.cache).toBe('no-store');
  });

  it('rejects A-to-B-to-A token selection before dispatch instead of accepting B as A', async () => {
    const transport = vi.fn<typeof fetch>();
    vi.stubGlobal('fetch', transport);
    provider.getSession.mockResolvedValueOnce(sessionA).mockResolvedValueOnce(sessionB);
    await expect(
      new SupabaseIdentityAdapter().resolveInternalId('supabase', subjectA),
    ).rejects.toMatchObject({ status: 401 });
    expect(transport).not.toHaveBeenCalled();
    expect(provider.binding).not.toHaveBeenCalled();
  });

  it('does not trust a stored user ID that differs from the credential verified by the server', async () => {
    const server = rpcServer();
    let status: number | undefined;
    vi.stubGlobal('fetch', async (input: RequestInfo | URL, init?: RequestInit) => {
      const response = await server.fetch(new Request(input, init));
      status = response.status;
      return response;
    });
    provider.getSession.mockResolvedValue({
      data: { session: { access_token: 'session-b', user: { id: subjectA } } },
      error: null,
    });
    await expect(
      new SupabaseIdentityAdapter().resolveInternalId('supabase', subjectA),
    ).rejects.toThrow();
    expect(status).toBe(401);
    expect(provider.binding).not.toHaveBeenCalled();
  });
});
