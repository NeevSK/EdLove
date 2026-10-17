import { OpenAPIHandler } from '@orpc/openapi/fetch';
import { RPCHandler } from '@orpc/server/fetch';
import type { SovereignContract } from '@repo/core/api/contracts';
import { SovereignError } from '@repo/core/types/Errors';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { implement, type ORPCContext } from '../core/orpc';
import { sovereignErrorMiddleware } from '../core/orpcMiddleware';

const domainStatuses = [
  [400, 'BAD_REQUEST'],
  [401, 'UNAUTHORIZED'],
  [403, 'FORBIDDEN'],
  [404, 'NOT_FOUND'],
  [409, 'CONFLICT'],
  [429, 'TOO_MANY_REQUESTS'],
  [503, 'SERVICE_UNAVAILABLE'],
] as const;

const contract = {
  reject: {
    method: 'get',
    path: '/reject',
    request: {},
    responses: {
      200: { schema: z.strictObject({ accepted: z.boolean() }), description: 'Synthetic success' },
    },
    metadata: { policy: { action: 'read', subject: 'User' } },
  },
} satisfies SovereignContract;

describe.each(['rpc', 'openapi'] as const)('converted domain errors through %s', (transport) => {
  it.each(domainStatuses)(
    'retains handler status %i and protocol code %s',
    async (status, code) => {
      const impl = implement(contract).$context<ORPCContext>();
      const router = impl.router({
        reject: impl.reject.use(sovereignErrorMiddleware).handler(() => {
          throw new SovereignError({
            status,
            code: 'DOMAIN_REJECTION',
            detail: 'The operation cannot be applied.',
          });
        }),
      });
      const handler = transport === 'rpc' ? new RPCHandler(router) : new OpenAPIHandler(router);
      const request = new Request('http://test/reject', {
        method: transport === 'rpc' ? 'POST' : 'GET',
        ...(transport === 'rpc'
          ? { headers: { 'content-type': 'application/json' }, body: '{"json":{}}' }
          : {}),
      });
      const result = await handler.handle(request, {
        context: { user: { id: 'synthetic-account' }, requestId: 'domain-wire-request' },
      });
      expect(result.matched).toBe(true);
      expect(result.response?.status).toBe(status);
      const wire: unknown = await result.response?.json();
      const payload = transport === 'rpc' ? z.object({ json: z.unknown() }).parse(wire).json : wire;
      expect(payload).toMatchObject({
        code,
        message: 'The operation cannot be applied.',
        data: { code: 'DOMAIN_REJECTION', requestId: 'domain-wire-request' },
      });
    },
  );
});
