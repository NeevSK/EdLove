import { EventType } from '@tanstack/ai';
import { Hono } from 'hono';
import { describe, expect, it, vi } from 'vitest';
import { aiRouter } from '../ai/routes';

let capturedAbortSignal: AbortSignal | undefined;

// Mock Orchestrator to capture abort signal and verify event stream
vi.mock('../ai/domain/Orchestrator', () => {
  return {
    Orchestrator: class MockOrchestrator {
      constructor(
        public billingAdapter: any,
        public getLlmAdapter: (provider: string) => any,
      ) {}

      async processChat(
        _userId: string,
        _msg: string,
        _history: any,
        _context: any,
        abortSignal?: AbortSignal,
      ) {
        capturedAbortSignal = abortSignal;
        return (async function* () {
          yield {
            type: EventType.RUN_STARTED,
            threadId: 't-resilient-1',
            runId: 'r-resilient-1',
          };
          yield {
            type: EventType.TEXT_MESSAGE_CONTENT,
            messageId: 'm-1',
            delta: 'Real-time resilient token stream',
          };
          yield {
            type: EventType.RUN_FINISHED,
            threadId: 't-resilient-1',
            runId: 'r-resilient-1',
            finishReason: 'stop',
            usage: { totalTokens: 18 },
          };
        })();
      }
    },
  };
});

// Mock billing and persistence
vi.mock('../ai/adapters/DbBillingAdapter', () => {
  return {
    DbBillingAdapter: class MockBilling {
      async resolveBilling() {
        return {
          mode: 'baseline',
          provider: 'gemini',
          model: 'gemini-2.5-flash',
          apiKey: 'mock-gemini-key',
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

describe('Sanctuary API: AI Streaming Resilience & Edge Anti-Buffering', () => {
  const app = new Hono();

  app.use('*', async (c, next) => {
    c.set('user' as any, { id: 'usr-resilience-42' });
    c.set('db' as any, {});
    c.set('requestId' as any, 'req-resilience-123');
    await next();
  });
  app.route('/ai', aiRouter);

  it('injects mandatory Render anti-buffering headers and delivers NDJSON', async () => {
    const res = await app.request('/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Explain quantum entanglement.' }],
      }),
    });

    expect(res.status).toBe(200);
    // Crucial Render reverse proxy & CDN anti-buffering headers
    expect(res.headers.get('x-accel-buffering')).toBe('no');
    expect(res.headers.get('cache-control')).toContain('no-cache');
    expect(res.headers.get('cache-control')).toContain('no-transform');
    expect(res.headers.get('content-type')).toContain('application/x-ndjson');

    const text = await res.text();
    const lines = text.split('\n').filter((l) => l.trim().length > 0);
    expect(lines.length).toBe(3);

    const chunk1 = JSON.parse(lines[0]);
    const chunk2 = JSON.parse(lines[1]);
    const chunk3 = JSON.parse(lines[2]);

    expect(chunk1.type).toBe(EventType.RUN_STARTED);
    expect(chunk2.type).toBe(EventType.TEXT_MESSAGE_CONTENT);
    expect(chunk2.delta).toBe('Real-time resilient token stream');
    expect(chunk3.type).toBe(EventType.RUN_FINISHED);
  });

  it('forwards request AbortSignal from Hono down to Orchestrator', async () => {
    capturedAbortSignal = undefined;
    const controller = new AbortController();

    const res = await app.request('/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Stream with abort signal' }],
      }),
      signal: controller.signal,
    });

    expect(res.status).toBe(200);
    expect(capturedAbortSignal).toBeDefined();
    expect(capturedAbortSignal?.aborted).toBe(false);
  });
});
