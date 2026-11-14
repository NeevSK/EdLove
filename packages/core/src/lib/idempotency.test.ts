import { ORPCError } from '@orpc/client';
import { ORPCError as ServerORPCError } from '@orpc/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createIdempotencyMiddleware, idempotencyStore, withIdempotency } from './idempotency';

const key = '2eb8ecad-9ce8-4a03-9948-6a9a57b5bde1';
const procedure = { method: 'POST', path: '/attendance', input: { present: true } };

beforeEach(() => idempotencyStore.destroy());

describe('idempotency across the client/server error export boundary', () => {
  it('uses the identical error class exported by the server', () => {
    expect(ORPCError).toBe(ServerORPCError);
    expect(new ORPCError('FORBIDDEN')).toBeInstanceOf(ServerORPCError);
  });

  it('retains required-key rejection before a mutation runs', async () => {
    const next = vi.fn();
    await expect(
      createIdempotencyMiddleware({ optional: false })(
        {
          context: { user: { id: 'account-1' } },
          procedure,
        },
        next,
      ),
    ).rejects.toMatchObject({
      code: 'BAD_REQUEST',
      data: { code: 'IDEMPOTENCY_KEY_REQUIRED' },
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('reuses a successful result and rejects replay by another account', async () => {
    const middleware = createIdempotencyMiddleware();
    const next = vi.fn().mockResolvedValue({ saved: true });
    const options = { context: { user: { id: 'account-1' }, idempotencyKey: key }, procedure };
    await expect(middleware(options, next)).resolves.toEqual({ saved: true });
    await expect(middleware(options, next)).resolves.toEqual({ saved: true });
    expect(next).toHaveBeenCalledTimes(1);
    await expect(
      middleware(
        {
          ...options,
          context: { user: { id: 'account-2' }, idempotencyKey: key },
        },
        next,
      ),
    ).rejects.toMatchObject({
      code: 'FORBIDDEN',
      data: { code: 'IDEMPOTENCY_KEY_CONFLICT' },
    });
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('retains retry after a transient failure', async () => {
    const operation = vi
      .fn()
      .mockRejectedValueOnce(new Error('Network interrupted'))
      .mockResolvedValue('saved');
    await expect(withIdempotency(key, operation, { retryDelay: 0 })).resolves.toBe('saved');
    expect(operation).toHaveBeenCalledTimes(2);
  });

  it('never retries an idempotency conflict', async () => {
    const error = new ORPCError('FORBIDDEN', { data: { code: 'IDEMPOTENCY_KEY_CONFLICT' } });
    const operation = vi.fn().mockRejectedValue(error);
    await expect(withIdempotency(key, operation, { retryDelay: 0 })).rejects.toBe(error);
    expect(operation).toHaveBeenCalledTimes(1);
  });
});
