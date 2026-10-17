import { Hono } from 'hono';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { registerNativeORPCRoutes } from '../core/routes/orpc';

vi.mock('../core/router', () => ({
  buildORPCContextFromHono: vi.fn(async () => ({ requestId: 'synthetic-request' })),
}));

describe('native RPC diagnostic privacy', () => {
  afterEach(() => vi.restoreAllMocks());

  it('retains dispatch diagnostics without logging query contents', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const handle = vi.fn(async (_request: Request) => ({
      matched: true,
      response: new Response('ok'),
    }));
    const app = new Hono();
    registerNativeORPCRoutes(app, { handle });

    const response = await app.request('/api/self/getJournalHistory?note=synthetic-secret');

    expect(response.status).toBe(200);
    expect(handle).toHaveBeenCalledOnce();
    const dispatched = handle.mock.calls[0]?.[0];
    expect(dispatched?.url).toContain('?note=synthetic-secret');
    expect(log).toHaveBeenCalledWith(
      '[diag-native]',
      'GET',
      '/api/self/getJournalHistory',
      'matched=',
      true,
      'status=',
      200,
    );
    expect(JSON.stringify(log.mock.calls)).not.toContain('synthetic-secret');
    expect(JSON.stringify(log.mock.calls)).not.toContain('?note=');
  });

  it('preserves unmatched dispatch as 404 without logging its query', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const handle = vi.fn(async () => ({ matched: false }));
    const app = new Hono();
    registerNativeORPCRoutes(app, { handle });
    const response = await app.request('/api/self/getJournalHistory?note=unmatched-secret');
    expect(response.status).toBe(404);
    expect(await response.text()).toBe('Not Found');
    expect(log).toHaveBeenCalledWith(
      '[diag-native]',
      'GET',
      '/api/self/getJournalHistory',
      'matched=',
      false,
      'status=',
      undefined,
    );
    expect(JSON.stringify(log.mock.calls)).not.toContain('unmatched-secret');
  });

  it('propagates dispatch failures to the app error boundary without a success log', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const failure = new Error('synthetic-dispatch-failure');
    const handle = vi.fn(async () => {
      throw failure;
    });
    const observed = vi.fn();
    const app = new Hono();
    app.onError((error, c) => {
      observed(error);
      return c.text('Unavailable', 503);
    });
    registerNativeORPCRoutes(app, { handle });
    const response = await app.request('/api/self/getJournalHistory?note=failed-secret');
    expect(response.status).toBe(503);
    expect(observed).toHaveBeenCalledWith(failure);
    expect(log).not.toHaveBeenCalled();
  });
});
