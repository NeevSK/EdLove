import { OpenAPIHandler } from '@orpc/openapi/fetch';
import { openapi } from '@orpc/openapi';
import { call, ORPCError } from '@orpc/server';
import { RPCHandler } from '@orpc/server/fetch';
import { APIError } from '@repo/core/types/API';
import { SovereignError } from '@repo/core/types/Errors';
import { describe, expect, it, vi } from 'vitest';
import { o } from '../core/orpc';
import { sovereignErrorMiddleware, toORPCError } from '../core/orpcMiddleware';
import { toSafeErrorTelemetry } from '../telemetry/safeErrorTelemetry';

describe('oRPC shared error projection', () => {
  it('preserves explicit API causes and falls back to diagnostic details', () => {
    const details = { operation: 'synthetic-operation' };
    const cause = new Error('synthetic-upstream-failure');
    const explicit = new APIError('Request failed', 'REQUEST_FAILED', details, true, cause);
    expect(explicit).toBeInstanceOf(SovereignError);
    expect(explicit.cause).toBe(cause);
    expect(explicit.reportedToTelemetry).toBe(true);
    expect(new APIError('Request failed', 'REQUEST_FAILED', details).cause).toBe(details);
    expect(new APIError('Request failed').cause).toBeUndefined();
  });
  it.each([
    [400, 'BAD_REQUEST'],
    [401, 'UNAUTHORIZED'],
    [403, 'FORBIDDEN'],
    [404, 'NOT_FOUND'],
    [409, 'CONFLICT'],
    [429, 'TOO_MANY_REQUESTS'],
    [503, 'SERVICE_UNAVAILABLE'],
    [502, 'INTERNAL_SERVER_ERROR'],
  ] as const)('retains domain status %s as protocol code %s', (status, code) => {
    expect(toORPCError(new SovereignError({ status, code: 'DOMAIN_CODE' })).code).toBe(code);
  });
  it('never projects an unknown exception message to the protocol client', () => {
    const projected = toORPCError(
      new Error('password=super-secret upstream failure'),
      'request-safe',
    );

    expect(projected).toBeInstanceOf(ORPCError);
    expect(projected.message).toBe('An unexpected platform error occurred.');
    expect(projected.message).not.toContain('super-secret');
    expect(projected.data).toMatchObject({
      code: 'INTERNAL_SERVER_ERROR',
      requestId: 'request-safe',
    });
  });

  it('preserves declared typed oRPC error data for the contract adapter', () => {
    const original = new ORPCError('FORBIDDEN', {
      message: 'The active school scope is not permitted.',
      data: { code: 'SCHOOL_SCOPE_FORBIDDEN' },
    });
    const projected = toORPCError(original, 'request-safe');

    expect(projected).toBe(original);
    expect(projected.code).toBe('FORBIDDEN');
    expect(projected.message).toBe('The active school scope is not permitted.');
    expect(projected.data).toEqual({ code: 'SCHOOL_SCOPE_FORBIDDEN' });
  });

  it('adds the request correlation id to a typed sovereign error when absent', () => {
    const projected = toORPCError(SovereignError.authenticationRequired(), 'request-safe');

    expect(projected.code).toBe('UNAUTHORIZED');
    expect(projected.data).toMatchObject({
      code: 'AUTHENTICATION_REQUIRED',
      requestId: 'request-safe',
    });
  });

  it.each([null, 'secret-password', { token: 'secret-password' }])(
    'handles non-Error throws without serializing their value: %j',
    (thrown) => {
      const projected = toORPCError(thrown, 'request-safe');
      expect(projected.code).toBe('INTERNAL_SERVER_ERROR');
      expect(JSON.stringify(projected)).not.toContain('secret-password');
      expect(projected.cause).toBeUndefined();
    },
  );

  it('preserves an existing domain correlation rather than replacing it', () => {
    const error = new SovereignError({
      status: 409,
      code: 'REVISION_CONFLICT',
      instance: 'original-request',
    });
    expect(toORPCError(error, 'fallback-request').data).toEqual({
      code: 'REVISION_CONFLICT',
      requestId: 'original-request',
    });
  });

  it('does not turn custom exception names into telemetry labels', () => {
    const error = new Error('password=secret');
    error.name = 'customer-token-secret';
    expect(toSafeErrorTelemetry(error, 'INTERNAL_SERVER_ERROR', 500)).toEqual({
      category: 'Error',
      code: 'INTERNAL_SERVER_ERROR',
      status: 500,
      message: 'request failed with INTERNAL_SERVER_ERROR',
    });
  });

  it('logs only safe data and projects the request id at the bootstrap middleware', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    const failure = new Error('password=secret');
    failure.name = 'customer-token-secret';
    const procedure = o.use(sovereignErrorMiddleware).handler(() => {
      throw failure;
    });
    try {
      await expect(
        call(procedure, undefined, {
          context: { user: { id: 'user' }, requestId: 'request-safe' },
        }),
      ).rejects.toMatchObject({
        code: 'INTERNAL_SERVER_ERROR',
        data: { requestId: 'request-safe' },
      });
      expect(log).toHaveBeenCalledWith('[oRPC] unexpected procedure failure', {
        category: 'Error',
        code: 'INTERNAL_SERVER_ERROR',
        status: 500,
        message: 'request failed with INTERNAL_SERVER_ERROR',
        requestId: 'request-safe',
      });
      expect(JSON.stringify(log.mock.calls)).not.toContain('secret');
    } finally {
      log.mockRestore();
    }
  });

  it.each(['rpc', 'openapi'] as const)(
    'keeps unexpected failures generic and correlated through %s',
    async (transport) => {
      const log = vi.spyOn(console, 'error').mockImplementation(() => {});
      const failure = o
        .meta(openapi({ method: 'GET', path: '/failure' }))
        .use(sovereignErrorMiddleware)
        .handler(() => {
          throw new Error('password=secret');
        });
      const handler =
        transport === 'rpc' ? new RPCHandler({ failure }) : new OpenAPIHandler({ failure });
      const request =
        transport === 'rpc'
          ? new Request('http://test/failure', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ json: {} }),
            })
          : new Request('http://test/failure');
      try {
        const result = await handler.handle(request, {
          context: { user: { id: 'user' }, requestId: 'request-safe' },
        });
        expect(result.matched).toBe(true);
        expect(result.response?.status).toBe(500);
        const wire = await result.response?.text();
        expect(wire).toContain('request-safe');
        expect(wire).toContain('An unexpected platform error occurred.');
        expect(wire).not.toContain('secret');
      } finally {
        log.mockRestore();
      }
    },
  );
});
