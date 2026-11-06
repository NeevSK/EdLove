import { createORPCClient, RPCSerializer } from '@orpc/client';
import { os, type RouterClient } from '@orpc/server';
import { createV1Link } from '@repo/core/api/v1/client';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { readServerConfig } from '../config';
import { API_BODY_LIMIT, app, createApp, createRuntimeState, type HostLogger } from '../core/app';
import type { APIContext } from '../core/context';
import {
  OperationConflict,
  OperationOutcomeUnknown,
  OperationRecoveryRequired,
} from '../operations/store';

describe('clean canonical API foundation', () => {
  it('retains admission after cancellation until non-cooperative work actually settles', async () => {
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
    const events: Parameters<HostLogger>[0][] = [];
    const host = createApp(fixture, {
      maxInFlightRequests: 1,
      logger: (event) => events.push(event),
    });
    const controller = new AbortController();
    const first = host.request('/api/v1/wait', {
      method: 'POST',
      body: '{}',
      signal: controller.signal,
    });
    try {
      await started;
      controller.abort();
      const rejected = await host.request('/api/v1/wait', { method: 'POST', body: '{}' });
      expect(rejected.status).toBe(503);
      expect(events).toContainEqual({
        event: 'api.admission.rejected',
        requestId: rejected.headers.get('x-request-id'),
        inFlight: 1,
        limit: 1,
      });
      release();
      await first;
      expect((await host.request('/api/v1/wait', { method: 'POST', body: '{}' })).status).toBe(200);
    } finally {
      release();
      await first;
    }
  });
  it('releases admission after rejected input, missing routes, and procedure failures', async () => {
    const fixture = {
      fail: os.input(z.string()).handler(() => {
        throw new Error('private');
      }),
    };
    const host = createApp(fixture, { maxInFlightRequests: 1, logger: () => {} });
    const post = (path: string, input: string | number) =>
      host.request(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(new RPCSerializer().serialize(input)),
      });
    expect((await post('/api/v1/fail', 1)).status).toBe(400);
    expect((await post('/api/v1/missing', 'value')).status).toBe(404);
    expect((await post('/api/v1/fail', 'value')).status).toBe(500);
    expect((await post('/api/v1/missing', 'value')).status).toBe(404);
  });
  it.each([
    [new OperationConflict(), 'CONFLICT', 'operation_key_conflict'],
    [new OperationRecoveryRequired(), 'CONFLICT', 'operation_recovery_required'],
    [new OperationOutcomeUnknown(), 'INTERNAL_SERVER_ERROR', 'operation_outcome_unknown'],
  ])(
    'preserves operation recovery classification through the native SDK: %s',
    async (failure, code, reason) => {
      const fixture = {
        mutate: os.handler(() => {
          throw failure;
        }),
      };
      const host = createApp(fixture, { logger: () => {} });
      const client = createORPCClient<RouterClient<typeof fixture>>(
        createV1Link({
          origin: 'https://foundation.test',
          fetch: async (url, init) => host.request(new Request(url, init)),
        }),
      );
      await expect(client.mutate()).rejects.toMatchObject({
        code,
        data: { reason, requestId: expect.any(String) },
      });
    },
  );
  it('reports runtime-only readiness and supplies server-generated correlation', async () => {
    const response = await app.request('/health/live', {
      headers: { 'X-Request-ID': 'caller-value' },
    });
    expect(response.status).toBe(200);
    expect(response.headers.get('x-request-id')).toMatch(/^[a-f0-9-]{36}$/);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(await (await app.request('/health/ready')).json()).toEqual({
      status: 'ready',
      scope: 'foundation-only',
      capabilities: 0,
    });
  });

  it.each([
    '/api/identity/bootstrap',
    '/api/self/logMood',
    '/api/openapi/attendance',
    '/api/v2/self',
    '/api/auth/login',
    '/api/mcp/tools',
    '/webhooks/telegram',
  ])('rejects retired path %s', async (path) => {
    expect((await app.request(path, { method: 'POST' })).status).toBe(404);
  });

  it('runs a native SDK fixture through the real Hono host without admitting it to the app', async () => {
    const fixture = {
      echo: os
        .$context<APIContext>()
        .input(z.strictObject({ text: z.string() }))
        .output(z.string())
        .handler(({ input }) => input.text),
    };
    const host = createApp(fixture);
    const client = createORPCClient<RouterClient<typeof fixture>>(
      createV1Link({
        origin: 'https://foundation.test',
        fetch: async (url, init) => host.request(new Request(url, init)),
      }),
    );
    expect(await client.echo({ text: 'hello' })).toBe('hello');
    const malformed = await host.request('/api/v1/echo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(new RPCSerializer().serialize({ text: 2 })),
    });
    expect(malformed.status).toBe(400);
    const emptyClient = createORPCClient<RouterClient<typeof fixture>>(
      createV1Link({
        origin: 'https://foundation.test',
        fetch: async (url, init) => app.request(new Request(url, init)),
      }),
    );
    await expect(emptyClient.echo({ text: 'unadmitted' })).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });

  it('redacts unexpected procedure errors through the native SDK', async () => {
    const fixture = {
      fail: os.$context<APIContext>().handler(() => {
        throw new Error('private-storage-secret');
      }),
    };
    const events: Parameters<HostLogger>[0][] = [];
    const host = createApp(fixture, { logger: (event) => events.push(event) });
    const client = createORPCClient<RouterClient<typeof fixture>>(
      createV1Link({
        origin: 'https://foundation.test',
        fetch: async (url, init) => host.request(new Request(url, init)),
      }),
    );
    await expect(client.fail()).rejects.toMatchObject({ code: 'INTERNAL_SERVER_ERROR' });
    const response = await host.request('/api/v1/fail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    });
    expect(await response.text()).not.toContain('private-storage-secret');
    const failures = events.filter((event) => event.event === 'api.request.failed');
    expect(failures).toHaveLength(2);
    expect(failures[1]).toEqual({
      event: 'api.request.failed',
      requestId: response.headers.get('x-request-id'),
      category: 'unhandled_procedure',
    });
    expect(events).toContainEqual(
      expect.objectContaining({
        event: 'api.request.responded',
        requestId: response.headers.get('x-request-id'),
        status: 500,
        headersDurationMs: expect.any(Number),
      }),
    );
    expect(JSON.stringify(events)).not.toContain('private-storage-secret');
  });

  it('rejects oversized payloads in native error format', async () => {
    const response = await app.request('/api/v1/unadmitted', {
      method: 'POST',
      body: 'x'.repeat(API_BODY_LIMIT + 1),
    });
    expect(response.status).toBe(413);
    expect(await response.text()).toContain('PAYLOAD_TOO_LARGE');
  });

  it.each(['/api/v1', '/api/v1/unadmitted'])(
    'rejects cross-origin browser admission at %s',
    async (path) => {
      const response = await app.request(path, {
        method: 'POST',
        headers: { origin: 'https://untrusted.example' },
      });
      expect(response.status).toBe(403);
    },
  );

  describe('browser origins', () => {
    const web = createApp(undefined, { browserOrigins: ['https://web.foundation.test'] });

    it('answers the preflight of an allowed origin, without credentials', async () => {
      const response = await web.request('/api/v1/identity/session', {
        method: 'OPTIONS',
        headers: {
          origin: 'https://web.foundation.test',
          'access-control-request-method': 'POST',
          'access-control-request-headers': 'authorization,content-type',
        },
      });
      expect(response.status).toBe(204);
      expect(response.headers.get('access-control-allow-origin')).toBe(
        'https://web.foundation.test',
      );
      expect(response.headers.get('access-control-allow-credentials')).toBeNull();
      expect(response.headers.get('access-control-allow-headers')).toContain('Authorization');
    });

    it('still refuses every other origin, including on preflight', async () => {
      for (const method of ['POST', 'OPTIONS']) {
        const response = await web.request('/api/v1/identity/session', {
          method,
          headers: { origin: 'https://web.foundation.test.untrusted.example' },
        });
        expect(response.status).toBe(403);
        expect(response.headers.get('access-control-allow-origin')).toBeNull();
      }
    });

    it('names the allowed origin on a real response and refuses nothing extra', async () => {
      const response = await web.request('/api/v1/identity/session', {
        method: 'POST',
        headers: { origin: 'https://web.foundation.test', 'content-type': 'application/json' },
        body: '{}',
      });
      expect(response.status).not.toBe(403);
      expect(response.headers.get('access-control-allow-origin')).toBe(
        'https://web.foundation.test',
      );
    });
  });

  it('reports draining without changing liveness', async () => {
    const state = createRuntimeState();
    const host = createApp(undefined, { runtimeState: state });
    expect((await host.request('/health/ready')).status).toBe(200);
    state.startDraining();
    state.startDraining();
    const ready = await host.request('/health/ready');
    expect(ready.status).toBe(503);
    expect(await ready.json()).toEqual({
      status: 'not_ready',
      scope: 'foundation-only',
      reason: 'draining',
    });
    expect((await host.request('/health/live')).status).toBe(200);
  });

  it('refuses new v1 requests during drain before entering a procedure', async () => {
    const state = createRuntimeState();
    let calls = 0;
    const fixture = {
      echo: os.$context<APIContext>().handler(() => {
        calls++;
        return 'ok';
      }),
    };
    const events: Parameters<HostLogger>[0][] = [];
    const host = createApp(fixture, { runtimeState: state, logger: (event) => events.push(event) });
    state.startDraining();
    for (const path of ['/api/v1', '/api/v1/echo']) {
      const response = await host.request(path, {
        method: 'POST',
        headers: { 'X-Request-ID': 'caller-controlled' },
        body: '{}',
      });
      const requestId = response.headers.get('x-request-id');
      expect(response.status).toBe(503);
      expect(requestId).toMatch(/^[a-f0-9-]{36}$/);
      expect(new RPCSerializer().deserialize(await response.json())).toMatchObject({
        code: 'SERVICE_UNAVAILABLE',
        data: { requestId },
      });
      expect(events).toContainEqual(
        expect.objectContaining({ event: 'api.request.responded', requestId, status: 503 }),
      );
    }
    const client = createORPCClient<RouterClient<typeof fixture>>(
      createV1Link({
        origin: 'https://foundation.test',
        fetch: async (url, init) => host.request(new Request(url, init)),
      }),
    );
    await expect(client.echo()).rejects.toMatchObject({ code: 'SERVICE_UNAVAILABLE' });
    expect(
      (await host.request('/api/v1/echo', { method: 'POST', body: 'x'.repeat(API_BODY_LIMIT + 1) }))
        .status,
    ).toBe(503);
    expect(calls).toBe(0);
    expect(
      (
        await host.request('/api/v1/echo', {
          method: 'POST',
          headers: { origin: 'https://untrusted.example' },
        })
      ).status,
    ).toBe(403);
  });

  it('categorizes unexpected host errors without logging error contents', async () => {
    const events: Parameters<HostLogger>[0][] = [];
    const host = createApp(undefined, {
      runtimeState: createRuntimeState(),
      logger: (event) => events.push(event),
    });
    host.get('/test-http-error', () => {
      throw new Error('private-http-secret');
    });
    const response = await host.request('/test-http-error');
    expect(response.status).toBe(500);
    expect(events).toContainEqual({
      event: 'api.request.failed',
      requestId: response.headers.get('x-request-id'),
      category: 'unhandled_http',
    });
    expect(JSON.stringify(events)).not.toContain('private-http-secret');
    expect(await response.text()).not.toContain('private-http-secret');
  });

  it('delivers deadline and caller cancellation to the SDK procedure signal', async () => {
    const signals: AbortSignal[] = [];
    let notifyStarted: (() => void) | undefined;
    const started = new Promise<void>((resolve) => {
      notifyStarted = resolve;
    });
    const fixture = {
      wait: os.$context<APIContext>().handler(async ({ signal }) => {
        if (!signal) throw new Error('missing procedure signal');
        signals.push(signal);
        if (signals.length === 2) notifyStarted?.();
        await new Promise<void>((resolve) => {
          if (signal.aborted) resolve();
          else signal.addEventListener('abort', () => resolve(), { once: true });
        });
        return { aborted: signal.aborted };
      }),
    };
    const host = createApp(fixture, { timeoutMs: 20 });
    const deadline = await host.request('/api/v1/wait', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    });
    expect(deadline.status).toBe(200);
    expect(signals[0]?.aborted).toBe(true);
    const controller = new AbortController();
    const cancellationHost = createApp(fixture, { timeoutMs: 2000 });
    const request = cancellationHost.request('/api/v1/wait', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
      signal: controller.signal,
    });
    await started;
    expect(signals[1]?.aborted).toBe(false);
    controller.abort();
    await request;
    expect(signals[1]?.aborted).toBe(true);
  });

  it('fails startup configuration instead of choosing a port after malformed input', () => {
    expect(() => readServerConfig({ PORT: 'oops' })).toThrow();
    expect(() => readServerConfig({ PORT: '0' })).toThrow();
    expect(readServerConfig({ PORT: '3456' }).PORT).toBe(3456);
  });
});
