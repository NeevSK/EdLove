import { oc } from '@orpc/contract';
import { OpenAPIHandler } from '@orpc/openapi/fetch';
import { call } from '@orpc/server';
import { RPCHandler } from '@orpc/server/fetch';
import type { SovereignContract } from '@repo/core/api/contracts';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { implement, toORPCContract } from '../core/orpc';

describe('current contract converter boundary characterization', () => {
  const output = z.object({ success: z.boolean() });
  const contract = {
    probe: {
      method: 'post',
      path: '/probe',
      request: { body: z.object({ value: z.string() }) },
      responses: { 200: { schema: output, description: 'Probe result' } },
      metadata: { policy: { action: 'read', subject: 'User' } },
    },
  } satisfies SovereignContract;

  it('preserves input, policy and output in the validated conversion stage', () => {
    const metadata: unknown = toORPCContract(contract).probe['~orpc'];
    const shape = z
      .object({
        inputSchema: z.unknown().refine((value) => value !== undefined),
        outputSchema: z.unknown().refine((value) => value !== undefined),
        errorMap: z.record(z.string(), z.unknown()),
        meta: z.object({
          policy: z.object({ action: z.literal('read'), subject: z.literal('User') }),
        }),
      })
      .parse(metadata);

    expect(shape.outputSchema).toBe(output);
    expect(shape.errorMap).toEqual({});
  });

  it('enforces declared outputs without a compatibility bypass', () => {
    expect(toORPCContract(contract).probe['~orpc'].outputSchema).toBe(output);
  });

  it('honors strict inputs without guessing aliases', () => {
    const input = toORPCContract({
      probe: { ...contract.probe, request: { body: z.strictObject({ classroomId: z.string() }) } },
    }).probe['~orpc'].inputSchema;
    expect(input.safeParse({ body: { classroomId: 'class-1' } }).success).toBe(true);
    expect(input.safeParse({ body: { classroom_id: 'class-1' } }).success).toBe(false);
    expect(
      input.safeParse({ body: { classroomId: 'class-1', classroom_id: 'class-1' } }).success,
    ).toBe(false);
    expect(
      input.safeParse({ body: { classroomId: 'class-1', classroom_id: 'class-2' } }).success,
    ).toBe(false);
    expect(
      input.safeParse({ body: { classroomId: 'class-1', accountId: 'another-account' } }).success,
    ).toBe(false);
  });

  it('preserves declared stripping of unknown fields', () => {
    const input = toORPCContract(contract).probe['~orpc'].inputSchema;
    expect(input.safeParse({ body: { value: 'valid', legacyExtra: 'retained' } }).data).toEqual({
      body: { value: 'valid' },
    });
  });

  it('preserves explicit loose objects and schema refinements', () => {
    const body = z.looseObject({ value: z.string().trim().min(2) });
    const input = toORPCContract({
      probe: { ...contract.probe, request: { body } },
    }).probe['~orpc'].inputSchema;
    expect(input.parse({ body: { value: ' valid ', extra: 'retained' } })).toEqual({
      body: { value: 'valid', extra: 'retained' },
    });
    expect(input.safeParse({ body: { value: ' x ' } }).success).toBe(false);
  });

  it('does not infer id from an unrelated resource identifier', () => {
    const input = toORPCContract({
      probe: { ...contract.probe, request: { params: z.object({ id: z.string() }) } },
    }).probe['~orpc'].inputSchema;
    expect(input.safeParse({ params: { submissionId: 'submission-1' } }).success).toBe(false);
    expect(input.parse({ params: { id: 'submission-1' } })).toEqual({
      params: { id: 'submission-1' },
    });
  });

  it('retains declared errors without mixing error bodies into successful outputs', () => {
    const errors = { CONFLICT: { data: z.object({ revision: z.number() }) } };
    const converted = toORPCContract({
      probe: {
        ...contract.probe,
        errors,
        responses: {
          ...contract.probe.responses,
          400: { schema: z.object({ error: z.string() }), description: 'Failure' },
        },
      },
    }).probe['~orpc'];
    expect(converted.errorMap).toEqual(errors);
    expect(converted.outputSchema).toBe(output);
  });

  it('uses explicit schemas for multiple success statuses including nullable and 204', () => {
    const converted = toORPCContract({
      probe: {
        ...contract.probe,
        responses: {
          200: { schema: output.nullable(), description: 'Result or absent' },
          204: { schema: z.undefined(), description: 'No content' },
        },
      },
    }).probe['~orpc'];
    expect(converted.outputSchema.safeParse(null).success).toBe(true);
    expect(converted.outputSchema.safeParse(undefined).success).toBe(true);
    expect(converted.outputSchema.safeParse({ error: 'failure' }).success).toBe(false);
  });

  it('rejects invalid handler output and strips undeclared fields during execution', async () => {
    const impl = implement(contract);
    const invalid = impl.$context().probe.handler(() => ({ success: 'wrong' }));
    await expect(call(invalid, { body: { value: 'valid' } })).rejects.toMatchObject({
      code: 'INTERNAL_SERVER_ERROR',
    });
    const valid = impl
      .$context()
      .probe.handler(() => ({ success: true, internalSecret: 'never-send' }));
    await expect(call(valid, { body: { value: 'valid' } })).resolves.toEqual({ success: true });
  });

  it('preserves a native oRPC contract with output and declared error metadata', () => {
    const native = oc
      .output(output)
      .errors({ CONFLICT: { data: z.object({ version: z.number() }) } });

    expect(toORPCContract({ native }).native).toBe(native);
    expect(native['~orpc'].outputSchemas).toContain(output);
    expect(Object.keys(native['~orpc'].errorMap)).toEqual(['CONFLICT']);
  });

  it('rejects converted protected routes without policy metadata', () => {
    expect(() =>
      toORPCContract({
        probe: { method: 'get', path: '/probe', responses: contract.probe.responses },
      }),
    ).toThrow('missing explicit policy metadata');
  });

  it('refuses a route with only error response schemas', () => {
    expect(
      () =>
        toORPCContract({
          probe: {
            ...contract.probe,
            responses: { 400: { schema: z.object({ error: z.string() }), description: 'Invalid' } },
          },
        }).probe,
    ).toThrow('has no successful response schema');
  });

  it.each(['rpc', 'openapi'] as const)(
    'keeps invalid output private through the %s adapter',
    async (transport) => {
      const impl = implement({
        probe: { ...contract.probe, method: 'get', request: undefined },
      }).$context();
      const router = impl.router({
        probe: impl.$context().probe.handler(() => ({ success: 'secret-invalid-output' })),
      });
      const handler = transport === 'rpc' ? new RPCHandler(router) : new OpenAPIHandler(router);
      const request =
        transport === 'rpc'
          ? new Request('http://test/probe', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ json: {} }),
            })
          : new Request('http://test/probe');
      const result = await handler.handle(request);
      expect(result.matched).toBe(true);
      expect(result.response?.status).toBe(500);
      const wire = await result.response?.text();
      expect(wire).not.toContain('secret-invalid-output');
      expect(wire).toContain('INTERNAL_SERVER_ERROR');
    },
  );

  it('rejects strict output extras rather than silently loosening the schema', async () => {
    const strictContract = {
      probe: {
        ...contract.probe,
        responses: {
          200: { schema: z.strictObject({ success: z.boolean() }), description: 'Result' },
        },
      },
    };
    const procedure = implement(strictContract)
      .$context()
      .probe.handler(() => ({ success: true, secret: 'never-send' }));
    await expect(call(procedure, { body: { value: 'valid' } })).rejects.toMatchObject({
      code: 'INTERNAL_SERVER_ERROR',
    });
  });

  it.each(['rpc', 'openapi'] as const)(
    'maps canonical path/query/body inputs through %s',
    async (transport) => {
      const id = '123e4567-e89b-8101-8000-426614174000';
      const canonical = { params: { id }, query: { take: 2 }, body: { value: 'valid' } };
      const receive = vi.fn((input: unknown) => {
        expect(input).toEqual(canonical);
        return { success: true };
      });
      const impl = implement({
        probe: {
          ...contract.probe,
          path: '/probe/:id',
          request: {
            params: z.strictObject({ id: z.uuid() }),
            query: z.strictObject({ take: z.coerce.number().int().positive() }),
            body: contract.probe.request.body,
          },
        },
      }).$context();
      const router = impl.router({
        probe: impl.probe.handler(({ input }: { input: unknown }) => receive(input)),
      });
      const handler = transport === 'rpc' ? new RPCHandler(router) : new OpenAPIHandler(router);
      const request = new Request(
        transport === 'rpc' ? 'http://test/probe' : `http://test/probe/${id}?take=2`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(transport === 'rpc' ? { json: canonical } : canonical.body),
        },
      );
      const result = await handler.handle(request);
      expect(result.matched).toBe(true);
      expect(result.response?.status).toBe(200);
      expect(receive).toHaveBeenCalledExactlyOnceWith(canonical);
    },
  );
});
