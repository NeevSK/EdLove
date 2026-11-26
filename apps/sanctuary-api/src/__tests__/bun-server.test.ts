// Bun parity for the lifecycle rules in node-server.test.ts. Runs only inside Bun
// (`pnpm test:bun`); under Node the suite is skipped, so the Node gate is unchanged.
import { once } from 'node:events';
import { request } from 'node:http';
import { createConnection } from 'node:net';
import { inspect } from 'node:util';
import { createORPCClient, RPCSerializer } from '@orpc/client';
import { os, type RouterClient } from '@orpc/server';
import { createV1Link } from '@repo/core/api/v1/client';
import { describe, expect, it, vi } from 'vitest';
import { startBunServer } from '../bun-server';
import { readServerConfig } from '../config';
import { API_BODY_LIMIT } from '../core/app';

const inBun = typeof (globalThis as { Bun?: unknown }).Bun !== 'undefined';
const config = { ...readServerConfig({ NODE_ENV: 'test' }), PORT: 0 };
const origin = (runtime: { port: number }) => `http://127.0.0.1:${runtime.port}`;
function gate() {
  let open = () => {};
  const opened = new Promise<void>((resolve) => {
    open = resolve;
  });
  return { open, opened };
}

describe.skipIf(!inBun)('Bun HTTP adapter lifecycle over loopback sockets', () => {
  it('bounds in-flight requests, preserves health access, and recovers after completion', async () => {
    const entered = gate();
    const work = gate();
    const fixture = {
      wait: os.handler(async () => {
        entered.open();
        await work.opened;
        return 'done';
      }),
    };
    const runtime = await startBunServer({ ...config, API_MAX_IN_FLIGHT_REQUESTS: 1 }, fixture);
    const request = () =>
      fetch(`${origin(runtime)}/api/v1/wait`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      });
    const first = request();
    try {
      await entered.opened;
      const rejected = await request();
      expect(rejected.status).toBe(503);
      expect(rejected.headers.get('retry-after')).toBe('1');
      expect(new RPCSerializer().deserialize(await rejected.json())).toMatchObject({
        code: 'SERVICE_UNAVAILABLE',
      });
      expect((await fetch(`${origin(runtime)}/health/live`)).status).toBe(200);
      work.open();
      expect((await first).status).toBe(200);
      expect((await request()).status).toBe(200);
    } finally {
      work.open();
      await first;
      await runtime.shutdown();
    }
  });

  it('answers oversized bodies with the API error shape and serves the empty foundation', async () => {
    const runtime = await startBunServer(config);
    try {
      const ready = await fetch(`${origin(runtime)}/health/ready`);
      expect(ready.status).toBe(200);
      expect(await ready.json()).toMatchObject({ scope: 'foundation-only', capabilities: 0 });
      // Bun's own fetch client stalls when a server answers before reading the upload,
      // so the oversized body goes through node:http as an ordinary client would send it.
      const tooLarge = await new Promise<{ status: number; body: string }>((resolve, reject) => {
        const outgoing = request(`${origin(runtime)}/api/v1/missing`, { method: 'POST' }, (res) => {
          let body = '';
          res.setEncoding('utf8');
          res.on('data', (chunk: string) => {
            body += chunk;
          });
          res.on('end', () => resolve({ status: res.statusCode ?? 0, body }));
        });
        outgoing.on('error', reject);
        outgoing.end(Buffer.alloc(API_BODY_LIMIT + 1));
      });
      expect(tooLarge.status).toBe(413);
      expect(new RPCSerializer().deserialize(JSON.parse(tooLarge.body))).toMatchObject({
        code: 'PAYLOAD_TOO_LARGE',
      });
    } finally {
      await runtime.shutdown();
    }
  });

  it('drains in-flight work and shares one shutdown result across repeated signals', async () => {
    const entered = gate();
    const work = gate();
    const fixture = {
      wait: os.handler(async () => {
        entered.open();
        await work.opened;
        return 'completed';
      }),
    };
    const runtime = await startBunServer(config, fixture);
    const client = createORPCClient<RouterClient<typeof fixture>>(
      createV1Link({ origin: origin(runtime) }),
    );
    const request = client.wait();
    await entered.opened;
    const shutdown = runtime.shutdown();
    expect(runtime.shutdown()).toBe(shutdown);
    work.open();
    expect(await request).toBe('completed');
    expect(await shutdown).toEqual({ forced: false });
  });

  it('cancels the procedure signal when a real HTTP client disconnects', async () => {
    const entered = gate();
    const aborted = gate();
    const fixture = {
      wait: os.handler(async ({ signal }) => {
        if (!signal) throw new Error('Expected SDK signal');
        entered.open();
        await new Promise<void>((resolve) =>
          signal.addEventListener(
            'abort',
            () => {
              aborted.open();
              resolve();
            },
            { once: true },
          ),
        );
        return 'cancelled';
      }),
    };
    const runtime = await startBunServer(config, fixture);
    try {
      const controller = new AbortController();
      const client = createORPCClient<RouterClient<typeof fixture>>(
        createV1Link({ origin: origin(runtime) }),
      );
      const outcome = client.wait(undefined, { signal: controller.signal }).then(
        () => 'resolved',
        () => 'rejected',
      );
      await entered.opened;
      controller.abort();
      expect(await outcome).toBe('rejected');
      await aborted.opened;
    } finally {
      await runtime.shutdown();
    }
  });

  it('forces stalled connections closed at the drain deadline', async () => {
    const entered = gate();
    const fixture = {
      wait: os.handler(async ({ signal }) => {
        entered.open();
        await new Promise<void>((resolve) => signal?.addEventListener('abort', () => resolve()));
        return 'late';
      }),
    };
    const runtime = await startBunServer({ ...config, SHUTDOWN_TIMEOUT_MS: 30 }, fixture);
    const socket = createConnection(runtime.port, '127.0.0.1');
    socket.on('error', () => {});
    try {
      await once(socket, 'connect');
      socket.write(
        'POST /api/v1/wait HTTP/1.1\r\nHost: localhost\r\nContent-Type: application/json\r\nContent-Length: 2\r\n\r\n{}',
      );
      await entered.opened;
      expect(await runtime.shutdown()).toEqual({ forced: true });
    } finally {
      socket.destroy();
      await runtime.shutdown();
    }
  });

  it('rejects a port collision rather than reporting readiness', async () => {
    const runtime = await startBunServer(config);
    try {
      await expect(startBunServer({ ...config, PORT: runtime.port })).rejects.toMatchObject({
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
      const runtime = await startBunServer(config, fixture);
      try {
        const result = await fetch(`${origin(runtime)}/api/v1/stream`, {
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
    const cancelled = gate();
    const fixture = {
      stream: os.handler(
        () =>
          new ReadableStream<Uint8Array>({
            start(controller) {
              controller.enqueue(new TextEncoder().encode('first'));
            },
            cancel() {
              cancelled.open();
            },
          }),
      ),
    };
    const runtime = await startBunServer(config, fixture);
    try {
      const controller = new AbortController();
      const response = await fetch(`${origin(runtime)}/api/v1/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
        signal: controller.signal,
      });
      const reader = response.body?.getReader();
      if (!reader) throw new Error('Expected response body');
      expect((await reader.read()).done).toBe(false);
      controller.abort();
      await cancelled.opened;
    } finally {
      await runtime.shutdown();
    }
  });

  it('applies loopback backpressure when the client stops reading', async () => {
    let pulls = 0;
    const producing = gate();
    const stopped = gate();
    const fixture = {
      stream: os.handler(
        () =>
          new ReadableStream<Uint8Array>(
            {
              pull(controller) {
                pulls++;
                if (pulls === 2) producing.open();
                controller.enqueue(new Uint8Array(1024 * 1024));
              },
              cancel() {
                stopped.open();
              },
            },
            { highWaterMark: 0 },
          ),
      ),
    };
    const runtime = await startBunServer(config, fixture);
    try {
      const controller = new AbortController();
      await fetch(`${origin(runtime)}/api/v1/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
        signal: controller.signal,
      });
      await producing.opened;
      await new Promise<void>((resolve) => setTimeout(resolve, 100));
      expect(pulls).toBeLessThan(128);
      controller.abort();
      await stopped.opened;
    } finally {
      await runtime.shutdown();
    }
  });
});
