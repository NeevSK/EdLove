import { ORPCError } from '@orpc/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { authenticatedSovereignFetch } from '../clientRuntime';

const transport = vi.hoisted(() => vi.fn<typeof authenticatedSovereignFetch>());
vi.mock('../base', () => ({ SOVEREIGN_ORPC_URL: 'https://api.example.test/api' }));
vi.mock('../clientRuntime', () => ({ authenticatedSovereignFetch: transport }));

import { orpcClient } from '../orpcClient';

describe('oRPC installed SDK error compatibility', () => {
  beforeEach(() => transport.mockReset());

  it('allows the status assignment used by the native constructor transform', () => {
    const receiver: { status?: number } = {};
    expect(Reflect.set(ORPCError.prototype, 'status', 401, receiver)).toBe(true);
    expect(receiver.status).toBe(401);
  });

  it.each([
    ['UNAUTHORIZED', 401],
    ['FORBIDDEN', 403],
    ['SERVICE_UNAVAILABLE', 503],
  ])('preserves %s status and serialization through the real RPC decoder', async (code, status) => {
    const error = new ORPCError(code, { message: 'Request unavailable' });
    Object.assign(error, { status });
    transport.mockResolvedValue(Response.json({ json: error.toJSON() }, { status }));

    await expect((orpcClient.library as any).list({}, { context: { expectedAccountId: 'account-a' } }))
      .rejects.toMatchObject({ code, status, message: 'Request unavailable' });
    expect(transport).toHaveBeenCalledTimes(1);
    expect(transport.mock.calls[0]?.[2]).toBe('account-a');
    expect(error.toJSON()).toMatchObject({ code, status });
  });
});
