import { Hono } from 'hono';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { registerCanonicalV1Routes } from '../core/routes/canonicalV1';
import { registerNativeORPCRoutes } from '../core/routes/orpc';

vi.mock('../core/router', () => ({
  buildORPCContextFromHono: vi.fn(async () => ({ requestId: 'canonical-v1-route-fixture' })),
}));

describe('canonical v1 route registration', () => {
  afterEach(() => vi.restoreAllMocks());

  it('handles the literal v1 surface before the legacy /api/* fallback', async () => {
    const app = new Hono();
    const v1Handler = {
      handle: vi.fn(async () => ({ matched: true as const, response: new Response('v1') })),
    };
    const v0Handler = {
      handle: vi.fn(async () => ({ matched: true as const, response: new Response('v0') })),
    };
    registerCanonicalV1Routes(app, v1Handler);
    registerNativeORPCRoutes(app, v0Handler);

    const response = await app.request('/api/v1/classroom/attendance/batch-record', {
      method: 'POST',
    });

    expect(await response.text()).toBe('v1');
    expect(v1Handler.handle).toHaveBeenCalledWith(
      expect.any(Request),
      expect.objectContaining({ prefix: '/api/v1' }),
    );
    expect(v0Handler.handle).not.toHaveBeenCalled();
  });

  it('leaves v0 native procedures independently dispatchable', async () => {
    const app = new Hono();
    const v1Handler = {
      handle: vi.fn(async () => ({ matched: true as const, response: new Response('v1') })),
    };
    const v0Handler = {
      handle: vi.fn(async () => ({ matched: true as const, response: new Response('v0') })),
    };
    registerCanonicalV1Routes(app, v1Handler);
    registerNativeORPCRoutes(app, v0Handler);

    const response = await app.request('/api/attendance/batchRecord', { method: 'POST' });

    expect(await response.text()).toBe('v0');
    expect(v0Handler.handle).toHaveBeenCalledOnce();
    expect(v1Handler.handle).not.toHaveBeenCalled();
  });
});
