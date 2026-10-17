import { EventType } from '@tanstack/ai';
import { Hono } from 'hono';
import { describe, expect, it, vi } from 'vitest';
import { aiRouter } from '../ai/routes';

// Mock circuit breaker and orchestrator
vi.mock('../ai/domain/Orchestrator', () => {
  return {
    Orchestrator: class MockOrchestrator {
      constructor(
        public billingAdapter: any,
        public getLlmAdapter: (provider: string) => any,
      ) {}

      async processChat() {
        // Return an async iterable with minimal StreamChunks
        return (async function* () {
          yield {
            type: EventType.RUN_STARTED,
            threadId: 't-1',
            runId: 'r-1',
          };
          yield {
            type: EventType.TEXT_MESSAGE_START,
            messageId: 'm-1',
            role: 'assistant',
          };
          yield {
            type: EventType.TEXT_MESSAGE_CONTENT,
            messageId: 'm-1',
            delta: 'Hello from mock LLM',
          };
          yield {
            type: EventType.TEXT_MESSAGE_END,
            messageId: 'm-1',
          };
          yield {
            type: EventType.RUN_FINISHED,
            threadId: 't-1',
            runId: 'r-1',
            finishReason: 'stop',
            usage: { totalTokens: 42 },
          };
        })();
      }
    },
  };
});

// Mock database and billing adapters
vi.mock('../ai/adapters/DbBillingAdapter', () => {
  return {
    DbBillingAdapter: class MockBilling {
      async resolveBilling() {
        return {
          mode: 'baseline',
          provider: 'openai',
          model: 'gpt-4o-mini',
          apiKey: 'mock-key',
        };
      }
      async logUsage() {}
    },
  };
});

vi.mock('../ai/adapters/DbAiPersistenceAdapter', () => {
  return {
    DbAiPersistenceAdapter: class MockPersistence {
      async persistMessage() {}
    },
  };
});

describe('Sanctuary API: Dual AI SDK Runtime Switching', () => {
  const app = new Hono();
  // Attach test user and db context variables
  app.use('*', async (c, next) => {
    c.set('user' as any, { id: 'test-user-1' });
    c.set('db' as any, {});
    c.set('requestId' as any, 'req-test-123');
    await next();
  });
  app.route('/ai', aiRouter);

  const validPayload = {
    messages: [{ role: 'user', content: 'What is the speed of light?' }],
  };

  it('defaults to tanstack AI SDK when no header or parameter is provided', async () => {
    const res = await app.request('/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validPayload),
    });

    expect(res.status).toBe(200);
    expect(res.headers.get('x-ai-sdk')).toBe('tanstack');
  });

  it('selects Vercel AI SDK when x-ai-sdk: vercel header is present', async () => {
    const res = await app.request('/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-ai-sdk': 'vercel',
      },
      body: JSON.stringify(validPayload),
    });

    expect(res.status).toBe(200);
    expect(res.headers.get('x-ai-sdk')).toBe('vercel');
  });

  it('selects Vercel AI SDK when aiSdk=vercel query parameter is passed', async () => {
    const res = await app.request('/ai/chat?aiSdk=vercel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validPayload),
    });

    expect(res.status).toBe(200);
    expect(res.headers.get('x-ai-sdk')).toBe('vercel');
  });

  it('selects TanStack AI SDK when x-ai-sdk: tanstack header is explicitly provided', async () => {
    const res = await app.request('/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-ai-sdk': 'tanstack',
      },
      body: JSON.stringify(validPayload),
    });

    expect(res.status).toBe(200);
    expect(res.headers.get('x-ai-sdk')).toBe('tanstack');
  });

  it('selects Vercel AI SDK via context.aiSdk in request body', async () => {
    const res = await app.request('/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...validPayload,
        context: { aiSdk: 'vercel' },
      }),
    });

    expect(res.status).toBe(200);
    expect(res.headers.get('x-ai-sdk')).toBe('vercel');
  });
});
