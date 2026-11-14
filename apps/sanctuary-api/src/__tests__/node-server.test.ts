import { once } from 'node:events';
import { createConnection } from 'node:net';
import { inspect } from 'node:util';
import { createORPCClient, RPCSerializer } from '@orpc/client';
import { os, type RouterClient } from '@orpc/server';
import { createV1Link } from '@repo/core/api/v1/client';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { readServerConfig } from '../config';
import { API_BODY_LIMIT } from '../core/app';
import { startNodeServer } from '../node-server';

const config = { ...readServerConfig({ NODE_ENV: 'test' }), PORT: 0 };
function origin(server: Awaited<ReturnType<typeof startNodeServer>>['server']) {
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Expected a listening TCP server');
  return `http://127.0.0.1:${address.port}`;
}

describe('Node HTTP adapter lifecycle over loopback sockets', () => {
  it('bounds known-length requests, preserves health access, and recovers after completion', async () => {
    let entered = () => {};
    let release = () => {};
    const started = new Promise<void>((resolve) => {
      entered = resolve;
    });
    const work = new Promise<void>((resolve) => {
      release = resolve;
    });
    const fixture = {
      wait: os.handler(async () => {
        entered();
        await work;
        return 'done';
      }),
    };
    const runtime = await startNodeServer({ ...config, API_MAX_IN_FLIGHT_REQUESTS: 1 }, fixture);
    const request = () =>
      fetch(`${origin(runtime.server)}/api/v1/wait`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      });
    const first = request();
    try {
      await started;
      const rejected = await request();
      expect(rejected.status).toBe(503);
      expect(rejected.headers.get('retry-after')).toBe('1');
      expect(new RPCSerializer().deserialize(await rejected.json())).toMatchObject({
        code: 'SERVICE_UNAVAILABLE',
      });
      expect((await fetch(`${origin(runtime.server)}/health/live`)).status).toBe(200);
      release();
      expect((await first).status).toBe(200);
      expect((await request()).status).toBe(200);
    } finally {
      release();
      await first;
      await runtime.shutdown();
    }
  });
  it('bounds chunked request admission and releases it after a disconnect and an oversized body', async () => {
    const runtime = await startNodeServer({ ...config, API_MAX_UNKNOWN_LENGTH_REQUESTS: 1 });
    const socket = createConnection(Number(new URL(origin(runtime.server)).port), '127.0.0.1');
    const chunked = (body: Uint8Array) => {
      const init: RequestInit & { duplex: 'half' } = {
        method: 'POST',
        body: new ReadableStream({
          start(controller) {
            controller.enqueue(body);
            controller.close();
          },
        }),
        duplex: 'half',
      };
      return fetch(`${origin(runtime.server)}/api/v1/missing`, init);
    };
    try {
      await once(socket, 'connect');
      const accepted = once(runtime.server, 'request');
      socket.write(
        'POST /api/v1/missing HTTP/1.1\r\nHost: localhost\r\nTransfer-Encoding: chunked\r\n\r\n1\r\nx\r\n',
      );
      await accepted;
      const overloaded = await chunked(new Uint8Array([120]));
      expect(overloaded.status).toBe(503);
      expect(new RPCSerializer().deserialize(await overloaded.json())).toMatchObject({
        code: 'SERVICE_UNAVAILABLE',
        data: { requestId: expect.any(String) },
      });
      socket.destroy();
      await vi.waitFor(async () => {
        const response = await chunked(new Uint8Array([120]));
        expect(response.status).toBe(404);
      });
      const tooLarge = await chunked(new Uint8Array(API_BODY_LIMIT + 1));
      expect(tooLarge.status).toBe(413);
      expect(new RPCSerializer().deserialize(await tooLarge.json())).toMatchObject({
        code: 'PAYLOAD_TOO_LARGE',
      });
      expect((await chunked(new Uint8Array([120]))).status).toBe(404);
    } finally {
      socket.destroy();
      await runtime.shutdown();
    }
  });

  it('holds chunked admission while the downstream procedure is running', async () => {
    let entered = () => {};
    let release = () => {};
    const started = new Promise<void>((resolve) => {
      entered = resolve;
    });
    const work = new Promise<void>((resolve) => {
      release = resolve;
    });
    const fixture = {
      wait: os.input(z.object({ message: z.string() })).handler(async () => {
        entered();
        await work;
        return 'done';
      }),
    };
    const runtime = await startNodeServer(
      { ...config, API_MAX_UNKNOWN_LENGTH_REQUESTS: 1 },
      fixture,
    );
    const client = createORPCClient<RouterClient<typeof fixture>>(
      createV1Link({
        origin: origin(runtime.server),
        fetch: async (url, init) => {
          const request = new Request(url, init);
          const streamed: RequestInit & { duplex: 'half' } = {
            method: request.method,
            headers: request.headers,
            signal: request.signal,
            body: request.body,
            duplex: 'half',
          };
          return fetch(request.url, streamed);
        },
      }),
    );
    try {
      const first = client.wait({ message: 'first' });
      await started;
      await expect(client.wait({ message: 'second' })).rejects.toMatchObject({
        code: 'SERVICE_UNAVAILABLE',
      });
      release();
      expect(await first).toBe('done');
      expect(await client.wait({ message: 'third' })).toBe('done');
    } finally {
      release();
      await runtime.shutdown();
    }
  });

  it.each(['headers', 'body'])(
    'terminates an incomplete %s request with HTTP 408',
    async (phase) => {
      const runtime = await startNodeServer(
        {
          ...config,
          NODE_HEADERS_TIMEOUT_MS: 20,
          NODE_REQUEST_TIMEOUT_MS: 40,
        },
        { wait: os.handler(() => 'unexpected') },
      );
      const socket = createConnection(Number(new URL(origin(runtime.server)).port), '127.0.0.1');
      const chunks: Buffer[] = [];
      socket.on('data', (chunk: Buffer) => chunks.push(chunk));
      try {
        await once(socket, 'connect');
        const closed = once(socket, 'close');
        socket.write(
          phase === 'headers'
            ? 'POST /api/v1/wait HTTP/1.1\r\nHost: localhost\r\n'
            : 'POST /api/v1/wait HTTP/1.1\r\nHost: localhost\r\nContent-Type: application/json\r\nContent-Length: 100\r\n\r\n{',
        );
        await closed;
        expect(Buffer.concat(chunks).toString()).toMatch(/^HTTP\/1\.1 408 /);
      } finally {
        socket.destroy();
        await runtime.shutdown();
      }
    },
  );

  it('applies receive budgets and serves the empty canonical foundation', async () => {
    const runtime = await startNodeServer(config);
    try {
      expect(runtime.server.headersTimeout).toBe(config.NODE_HEADERS_TIMEOUT_MS);
      expect(runtime.server.requestTimeout).toBe(config.NODE_REQUEST_TIMEOUT_MS);
      expect(runtime.server.keepAliveTimeout).toBe(config.NODE_KEEP_ALIVE_TIMEOUT_MS);
      expect(runtime.server.maxHeadersCount).toBe(config.NODE_MAX_HEADERS);
      expect(runtime.server.maxConnections).toBe(config.NODE_MAX_CONNECTIONS);
      const ready = await fetch(`${origin(runtime.server)}/health/ready`);
      expect(ready.status).toBe(200);
      expect(await ready.json()).toMatchObject({ scope: 'foundation-only', capabilities: 0 });
      const oversized = await fetch(`${origin(runtime.server)}/health/live`, {
        headers: { 'x-oversized': 'x'.repeat(config.NODE_MAX_HEADER_BYTES) },
      });
      expect(oversized.status).toBe(431);
    } finally {
      await runtime.shutdown();
    }
    expect(runtime.server.listening).toBe(false);
  });

  it('drains in-flight work and shares one shutdown result across repeated signals', async () => {
    let release = () => {};
    let entered = () => {};
    const started = new Promise<void>((resolve) => {
      entered = resolve;
    });
    const work = new Promise<void>((resolve) => {
      release = resolve;
    });
    const fixture = {
      wait: os.handler(async () => {
        entered();
        await work;
        return 'completed';
      }),
    };
    const runtime = await startNodeServer(config, fixture);
    const client = createORPCClient<RouterClient<typeof fixture>>(
      createV1Link({ origin: origin(runtime.server) }),
    );
    const request = client.wait();
    await started;
    const shutdown = runtime.shutdown();
    expect(runtime.shutdown()).toBe(shutdown);
    release();
    expect(await request).toBe('completed');
    expect(await shutdown).toEqual({ forced: false });
  });

  it('cancels the procedure signal when a real HTTP client disconnects', async () => {
    let entered = () => {};
    let observedAbort = () => {};
    const started = new Promise<void>((resolve) => {
      entered = resolve;
    });
    const aborted = new Promise<void>((resolve) => {
      observedAbort = resolve;
    });
    const fixture = {
      wait: os.handler(async ({ signal }) => {
        if (!signal) throw new Error('Expected SDK signal');
        entered();
        await new Promise<void>((resolve) =>
          signal.addEventListener(
            'abort',
            () => {
              observedAbort();
              resolve();
            },
            { once: true },
          ),
        );
        return 'cancelled';
      }),
    };
    const runtime = await startNodeServer(config, fixture);
    try {
      const controller = new AbortController();
      const client = createORPCClient<RouterClient<typeof fixture>>(
        createV1Link({ origin: origin(runtime.server) }),
      );
      const outcome = client.wait(undefined, { signal: controller.signal }).then(
        () => 'resolved',
        () => 'rejected',
      );
      await started;
      controller.abort();
      expect(await outcome).toBe('rejected');
      await aborted;
    } finally {
      await runtime.shutdown();
    }
  });

  it('forces stalled connections closed at the drain deadline', async () => {
    const runtime = await startNodeServer({ ...config, SHUTDOWN_TIMEOUT_MS: 30 });
    const socket = createConnection(Number(new URL(origin(runtime.server)).port), '127.0.0.1');
    try {
      await once(socket, 'connect');
      socket.write(
        'POST /api/v1/missing HTTP/1.1\r\nHost: localhost\r\nContent-Length: 100\r\n\r\nx',
      );
      // The server must observe the partial request before shutdown starts.
      await once(runtime.server, 'request');
      expect(await runtime.shutdown()).toEqual({ forced: true });
    } finally {
      socket.destroy();
      await runtime.shutdown();
    }
  });

  it('rejects a port collision rather than reporting readiness', async () => {
    const runtime = await startNodeServer(config);
    try {
      const port = Number(new URL(origin(runtime.server)).port);
      await expect(startNodeServer({ ...config, PORT: port })).rejects.toMatchObject({
        code: 'EADDRINUSE',
      });
    } finally {
      await runtime.shutdown();
    }
  });

  it.each(['initial', 'late', 'malformed'] as const)(
    'terminates %s response stream failures without exposing data',
    async (mode) => {
      const secret = 'private-stream-secret';
      let pulls = 0;
      const fixture = {
        stream: os.handler(
          () =>
            new ReadableStream<unknown>({
              async pull(controller) {
                if (mode === 'malformed') controller.enqueue(secret);
                else if (mode === 'late' && pulls++ === 0)
                  controller.enqueue(new TextEncoder().encode('first'));
                else {
                  if (mode === 'late')
                    await new Promise<void>((resolve) => setTimeout(resolve, 20));
                  controller.error(new Error(secret));
                }
              },
            }),
        ),
      };
      const logged: unknown[][] = [];
      const spy = vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
        logged.push(args);
      });
      const runtime = await startNodeServer(config, fixture);
      try {
        const result = await fetch(`${origin(runtime.server)}/api/v1/stream`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: '{}',
        }).then(async (response) => response.text());
        expect(result).not.toContain(secret);
        throw new Error('A failed stream must not complete successfully');
      } catch (error) {
        expect(error).not.toHaveProperty(
          'message',
          'A failed stream must not complete successfully',
        );
        expect(String(error)).not.toContain(secret);
      } finally {
        await runtime.shutdown();
        spy.mockRestore();
      }
      expect(inspect(logged, { depth: 8 })).not.toContain(secret);
      expect(logged).toContainEqual([{ event: 'api.response.failed', category: 'stream' }]);
    },
  );

  it('propagates client cancellation to a streaming producer', async () => {
    let cancelled = () => {};
    const cancellation = new Promise<void>((resolve) => {
      cancelled = resolve;
    });
    const fixture = {
      stream: os.handler(
        () =>
          new ReadableStream<Uint8Array>({
            start(controller) {
              controller.enqueue(new TextEncoder().encode('first'));
            },
            cancel() {
              cancelled();
            },
          }),
      ),
    };
    const runtime = await startNodeServer(config, fixture);
    try {
      const controller = new AbortController();
      const response = await fetch(`${origin(runtime.server)}/api/v1/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
        signal: controller.signal,
      });
      const reader = response.body?.getReader();
      if (!reader) throw new Error('Expected response body');
      expect((await reader.read()).done).toBe(false);
      controller.abort();
      await cancellation;
    } finally {
      await runtime.shutdown();
    }
  });

  it('applies loopback backpressure when the client stops reading', async () => {
    let pulls = 0;
    let started = () => {};
    let cancelled = () => {};
    const producing = new Promise<void>((resolve) => {
      started = resolve;
    });
    const stopped = new Promise<void>((resolve) => {
      cancelled = resolve;
    });
    const fixture = {
      stream: os.handler(
        () =>
          new ReadableStream<Uint8Array>(
            {
              pull(controller) {
                pulls++;
                if (pulls === 2) started();
                controller.enqueue(new Uint8Array(1024 * 1024));
              },
              cancel() {
                cancelled();
              },
            },
            { highWaterMark: 0 },
          ),
      ),
    };
    const runtime = await startNodeServer(config, fixture);
    try {
      const controller = new AbortController();
      await fetch(`${origin(runtime.server)}/api/v1/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
        signal: controller.signal,
      });
      await producing;
      await new Promise<void>((resolve) => setTimeout(resolve, 100));
      expect(pulls).toBeLessThan(128);
      controller.abort();
      await stopped;
    } finally {
      await runtime.shutdown();
    }
  });
});
