import { createORPCClient } from '@orpc/client';
import { oc, type RouterContractClient } from '@orpc/contract';
import { implement, ORPCError } from '@orpc/server';
import { RPCHandler } from '@orpc/server/fetch';
import { describe, expect, expectTypeOf, it } from 'vitest';
import { z } from 'zod';
import { API_V1_PREFIX, createV1Client, createV1Link } from '../client';
import { type AppContractClient, appContract } from '../contract';

describe('v1 API foundation', () => {
  it('exposes no unadmitted procedures', () => {
    expect(Object.keys(appContract)).toEqual(['identity', 'authority']);
    expect(Object.keys(appContract.identity)).toEqual([
      'session',
      'scopes',
      'entry',
      'createInitialBond',
      'syncGrant',
    ]);
    expect(Object.keys(appContract.authority)).toEqual(['refreshSnapshot']);
    expectTypeOf(createV1Client()).toEqualTypeOf<AppContractClient>();
    expectTypeOf<keyof AppContractClient>().toEqualTypeOf<never>();
  });

  it('uses the native RPC protocol and injected fetch and headers', async () => {
    const fixture = { echo: oc.input(z.string()).output(z.string()) };
    const impl = implement(fixture);
    const handler = new RPCHandler(impl.router({ echo: impl.echo.handler(({ input }) => input) }));
    const seen: { url?: string; authorization?: string | null } = {};
    const link = createV1Link({
      origin: 'https://sanctuary.test',
      headers: () => ({ authorization: 'Bearer fixture' }),
      fetch: async (url, init) => {
        seen.url = url;
        seen.authorization = new Headers(init.headers).get('authorization');
        const result = await handler.handle(new Request(url, init), { prefix: API_V1_PREFIX });
        if (!result.matched || !result.response) throw new Error('Fixture route did not match');
        return result.response;
      },
    });
    const client = createORPCClient<RouterContractClient<typeof fixture>>(link);
    expect(await client.echo('hello')).toBe('hello');
    expect(new URL(seen.url ?? '').pathname).toBe('/api/v1/echo');
    expect(seen.authorization).toBe('Bearer fixture');
  });

  it('propagates native RPC errors and transport failures', async () => {
    const fixture = { fail: oc.output(z.string()) };
    const impl = implement(fixture);
    const handler = new RPCHandler(
      impl.router({
        fail: impl.fail.handler(() => {
          throw new ORPCError('FORBIDDEN');
        }),
      }),
    );
    const client = createORPCClient<RouterContractClient<typeof fixture>>(
      createV1Link({
        origin: 'https://sanctuary.test',
        fetch: async (url, init) => {
          const result = await handler.handle(new Request(url, init), { prefix: API_V1_PREFIX });
          if (!result.matched || !result.response) throw new Error('Fixture route did not match');
          return result.response;
        },
      }),
    );
    await expect(client.fail()).rejects.toMatchObject({ code: 'FORBIDDEN' });
    const unavailable = createORPCClient<RouterContractClient<typeof fixture>>(
      createV1Link({
        origin: 'https://sanctuary.test',
        fetch: async () => {
          throw new Error('network unavailable');
        },
      }),
    );
    await expect(unavailable.fail()).rejects.toThrow('network unavailable');
  });
});
