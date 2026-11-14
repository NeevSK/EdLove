import { createServer, type Server } from 'node:http';
import { createORPCClient } from '@orpc/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createV1Link } from '../client';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('v1 transport security', () => {
  it('does not forward credentials through a real HTTP redirect', async () => {
    vi.stubEnv('NODE_ENV', 'test');
    let targetRequests = 0;
    let sourceRequests = 0;
    const target = createServer((_request, response) => {
      targetRequests++;
      response.end();
    });
    const listen = async (server: Server) => {
      await new Promise<void>((resolve, reject) => {
        server.once('error', reject);
        server.listen(0, '127.0.0.1', resolve);
      });
      const address = server.address();
      if (!address || typeof address === 'string') throw new Error('Expected a TCP listener');
      return `http://127.0.0.1:${address.port}`;
    };
    let targetOrigin = '';
    const source = createServer((request, response) => {
      sourceRequests++;
      if (request.url === '/api/v1/direct') {
        response.setHeader('content-type', 'application/json');
        response.end(JSON.stringify({ json: 'ok' }));
      } else {
        response.writeHead(302, { location: `${targetOrigin}/capture` });
        response.end();
      }
    });
    try {
      targetOrigin = await listen(target);
      const sourceOrigin = await listen(source);
      const client = createORPCClient<{
        direct: () => Promise<string>;
        redirect: () => Promise<unknown>;
      }>(createV1Link({ origin: sourceOrigin, headers: { authorization: 'Bearer fixture' } }));
      await expect(client.direct()).resolves.toBe('ok');
      await expect(client.redirect()).rejects.toThrow();
      expect(sourceRequests).toBe(2);
      expect(targetRequests).toBe(0);

      vi.stubEnv('NODE_ENV', 'production');
      await expect(client.direct()).rejects.toThrow(/HTTPS/);
      expect(sourceRequests).toBe(2);
      expect(targetRequests).toBe(0);
    } finally {
      for (const server of [source, target]) {
        if (server.listening) {
          server.closeAllConnections();
          await new Promise<void>((resolve, reject) =>
            server.close((error) => (error ? reject(error) : resolve())),
          );
        }
      }
    }
  });
  it('rejects insecure production URLs before calling even an injected fetch', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const fetch = vi.fn(async () => new Response('{}'));
    const client = createORPCClient<{ probe: () => Promise<unknown> }>(
      createV1Link({ origin: 'http://localhost:3000', fetch }),
    );
    await expect(client.probe()).rejects.toThrow(/HTTPS/);
    expect(fetch).not.toHaveBeenCalled();
  });
  it('validates the resolved dynamic origin, forwards SDK context and refuses redirects', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const fetch = vi.fn(
      async () =>
        new Response(null, { status: 302, headers: { location: 'https://other.example' } }),
    );
    const client = createORPCClient<{ probe: () => Promise<unknown> }>(
      createV1Link({ origin: async () => 'https://api.example', fetch }),
    );
    await expect(client.probe()).rejects.toThrow(/redirect/);
    expect(fetch).toHaveBeenCalledOnce();
    expect(fetch.mock.calls[0]?.[0]).toBe('https://api.example/api/v1/probe');
    expect(fetch.mock.calls[0]?.[1]).toMatchObject({ redirect: 'error' });
    expect(fetch.mock.calls[0]?.[3]).toEqual(['probe']);
  });
  it('resolves a same-origin browser URL before validation', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubGlobal('location', { origin: 'https://app.example' });
    const fetch = vi.fn(async () => new Response(null, { status: 302 }));
    const client = createORPCClient<{ probe: () => Promise<unknown> }>(createV1Link({ fetch }));
    await expect(client.probe()).rejects.toThrow(/redirect/);
    expect(fetch.mock.calls[0]?.[0]).toBe('https://app.example/api/v1/probe');
  });
  it('rejects disabled TLS verification before dispatch', async () => {
    vi.stubEnv('NODE_TLS_REJECT_UNAUTHORIZED', '0');
    const fetch = vi.fn(async () => new Response('{}'));
    const client = createORPCClient<{ probe: () => Promise<unknown> }>(
      createV1Link({ origin: 'https://api.example', fetch }),
    );
    await expect(client.probe()).rejects.toThrow(/certificate verification/);
    expect(fetch).not.toHaveBeenCalled();
  });
});
