import './setup';
import { oc, eventIterator, defineMeta } from '@orpc/contract';
import { os, implement, call, ORPCError } from '@orpc/server';
import { RPCHandler } from '@orpc/server/fetch';
import { createORPCClient } from '@orpc/client';
import { RPCLink } from '@orpc/client/fetch';
import { openapi, getOpenAPIMeta } from '@orpc/openapi';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { ensureSecureUrl, SOVEREIGN_API_URL } from '@repo/core/api/base';
import { authenticatedSovereignFetch, setPqcWireEnabled } from '@repo/core/api/clientRuntime';

describe('oRPC v2 Real Capabilities & Quantum-Safe Wire Parity', () => {
  // Define custom typed metadata
  const [policyMeta, getPolicyMeta] = defineMeta(
    'policy',
    (incoming: { action: string; subject: string }, current) => ({ ...current, ...incoming }),
  );

  it('proves Capability 1: Native Streaming Procedure (eventIterator) with end-to-end client async iteration', async () => {
    // 1. Contract Definition with eventIterator
    const agentStreamContract = oc
      .meta(openapi({ method: 'POST', path: '/api/agent/stream-reasoning' }))
      .meta(policyMeta({ action: 'execute', subject: 'Agent' }))
      .input(z.object({ topic: z.string(), depth: z.number().default(1) }))
      .output(
        eventIterator(
          z.object({
            step: z.number(),
            phase: z.enum(['intent_classification', 'graph_reasoning', 'synthesis']),
            thought: z.string(),
            timestamp: z.number(),
          }),
        ),
      );

    // 2. Implementation with async generator
    const agentStreamImpl = implement(agentStreamContract).handler(async function* ({ input }) {
      yield {
        step: 1,
        phase: 'intent_classification',
        thought: `Classified topic: ${input.topic}`,
        timestamp: Date.now(),
      };
      yield {
        step: 2,
        phase: 'graph_reasoning',
        thought: `Evaluating sub-graphs at depth ${input.depth}`,
        timestamp: Date.now(),
      };
      yield {
        step: 3,
        phase: 'synthesis',
        thought: `Final answer synthesized for ${input.topic}`,
        timestamp: Date.now(),
      };
    });

    const router = os.router({
      agentStream: agentStreamImpl,
    });

    // 3. Mount on RPCHandler
    const handler = new RPCHandler(router);

    // 4. Client Link with standard origin
    const link = new RPCLink({
      url: '/',
      origin: 'http://localhost:3000',
      fetch: async (req, init) => {
        const response = await handler.handle(new Request(req, init));
        if (!response.response) throw new Error('No RPC response returned');
        return response.response;
      },
    });

    const client = createORPCClient<any>(link);

    // 5. Consume streaming procedure chunks via async iteration
    const stream = await client.agentStream({ topic: 'quantum-computing', depth: 3 });
    const collectedChunks: Array<{ step: number; phase: string; thought: string }> = [];

    for await (const chunk of stream) {
      collectedChunks.push({
        step: chunk.step,
        phase: chunk.phase,
        thought: chunk.thought,
      });
    }

    expect(collectedChunks).toHaveLength(3);
    expect(collectedChunks[0]?.phase).toBe('intent_classification');
    expect(collectedChunks[0]?.thought).toBe('Classified topic: quantum-computing');
    expect(collectedChunks[1]?.phase).toBe('graph_reasoning');
    expect(collectedChunks[2]?.phase).toBe('synthesis');
  });

  it('proves Capability 2: Directly Callable Procedures without network serialization overhead', async () => {
    interface Context {
      userId: string;
      role: string;
    }

    const testBuilder = os.$context<Context>();

    const calculateMetrics = testBuilder
      .input(z.object({ a: z.number(), b: z.number() }))
      .output(z.object({ sum: z.number(), requester: z.string() }))
      .handler(async ({ input, context }) => {
        return {
          sum: input.a + input.b,
          requester: `${context.userId}:${context.role}`,
        };
      });

    // Invoke in-memory directly via call()
    const result = await call(
      calculateMetrics,
      { a: 40, b: 2 },
      { context: { userId: 'usr-42', role: 'architect' } },
    );

    expect(result.sum).toBe(42);
    expect(result.requester).toBe('usr-42:architect');
  });

  it('proves Capability 3: Strongly-typed Metadata & OpenAPI Introspection', async () => {
    const secureEchoContract = oc
      .meta(openapi({ method: 'GET', path: '/api/v2/echo' }))
      .meta(policyMeta({ action: 'read', subject: 'Echo' }))
      .input(z.object({ message: z.string() }))
      .output(z.object({ echoed: z.string() }));

    const impl = implement(secureEchoContract).handler(async ({ input }) => ({
      echoed: input.message,
    }));

    const extractedPolicy = getPolicyMeta(impl);
    const extractedOpenApi = getOpenAPIMeta(impl);

    expect(extractedPolicy).toEqual({ action: 'read', subject: 'Echo' });
    expect(extractedOpenApi?.method).toBe('GET');
    expect(extractedOpenApi?.path).toBe('/api/v2/echo');
  });

  it('proves Capability 4: HTTPS Client Enforcement & PQC Zero-Trust Header Wire', async () => {
    // Verify HTTPS enforcement logic
    expect(ensureSecureUrl('http://api.gurudevi.app')).toBe('https://api.gurudevi.app');
    expect(ensureSecureUrl('api.gurudevi.app')).toBe('https://api.gurudevi.app');
    expect(ensureSecureUrl('http://localhost:3000')).toBe('http://localhost:3000');
    expect(ensureSecureUrl('http://127.0.0.1:8787')).toBe('http://127.0.0.1:8787');
    expect(ensureSecureUrl('http://sanctuary.test')).toBe('http://sanctuary.test');

    // Verify PQC wire injection in authenticated fetch
    setPqcWireEnabled(true);
    let capturedHeaders: Headers | undefined;

    const fakeFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      capturedHeaders = new Headers(init?.headers);
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: {
          'content-type': 'application/json',
          'x-pqc-status': 'hybrid-verified',
        },
      });
    };

    // Replace global fetch temporarily for intercept test
    const originalFetch = globalThis.fetch;
    globalThis.fetch = fakeFetch as any;

    try {
      const response = await authenticatedSovereignFetch('http://localhost:3000/api/probe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ping: true }),
      });

      expect(response.status).toBe(200);
      expect(capturedHeaders?.get('x-pqc-kem')).toBe('ML-KEM-768+X25519');
      expect(capturedHeaders?.get('x-sovereign-epoch')).toBeDefined();
      expect(Number(capturedHeaders?.get('x-sovereign-epoch'))).toBeGreaterThan(0);
      expect(capturedHeaders?.get('Idempotency-Key')).toBeDefined();
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
