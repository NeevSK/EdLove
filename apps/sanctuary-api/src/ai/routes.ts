import { toServerSentEventsResponse } from '@tanstack/ai';
import { Hono } from 'hono';
import { AnthropicAdapter } from './adapters/AnthropicAdapter';
import { DbBillingAdapter } from './adapters/DbBillingAdapter';
import { DeepSeekAdapter } from './adapters/DeepSeekAdapter';
import { GeminiAdapter } from './adapters/GeminiAdapter';
import { OpenAiAdapter } from './adapters/OpenAiAdapter';
import { Orchestrator } from './domain/Orchestrator';
import { rateLimit } from './middleware/rateLimit';

export const aiRouter = new Hono<any>();

aiRouter.post('/chat', rateLimit, async (c) => {
  const user = c.get('user');
  const db = c.get('db');

  if (!user || user.id === 'anonymous') {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const body = await c.req.json();
    const { message, history = [], context = {} } = body;

    if (!message) {
      return c.json({ error: 'Message is required' }, 400);
    }

    // 1. Setup Ports & Core Domain Orchestrator with Dynamic Factory Injection
    const billingAdapter = new DbBillingAdapter(db);
    const orchestrator = new Orchestrator(billingAdapter, (provider) => {
      switch (provider) {
        case 'gemini':
          return new GeminiAdapter();
        case 'anthropic':
          return new AnthropicAdapter();
        case 'deepseek':
          return new DeepSeekAdapter();
        default:
          return new OpenAiAdapter();
      }
    });

    // 2. Resolve billing info beforehand for logging accuracy
    const billingInfo = await billingAdapter
      .resolveBilling(user.id, context.billingMode ?? 'baseline', {
        byokKeyInput: context.byokKey,
        schoolId: context.schoolId,
        preferredProvider:
          context.billingMode === 'byok' ? undefined : (context.billingMode as any),
      })
      .catch(() => null);

    const start = Date.now();

    // 3. Process chat and generate stream
    const stream = await orchestrator.processChat(user.id, message, history, context);

    // 4. Convert stream to standard response
    const sseResponse = toServerSentEventsResponse(stream);
    const originalBody = sseResponse.body;

    if (!originalBody) {
      return sseResponse;
    }

    // 5. Intercept stream using TransformStream to record audit log on completion
    let chunkCount = 0;
    const transformStream = new TransformStream({
      transform(chunk, controller) {
        chunkCount++;
        controller.enqueue(chunk);
      },
      flush() {
        const durationMs = Date.now() - start;
        // Approximation: 4 tokens per chunk/event
        const tokensUsed = chunkCount * 4;
        billingAdapter
          .logUsage(user.id, billingInfo?.model || 'gpt-4o-mini', tokensUsed, durationMs)
          .catch((logErr) => console.error('[aiRouter] Logging failed:', logErr));
      },
    });

    const transformedBody = originalBody.pipeThrough(transformStream);

    return new Response(transformedBody, {
      status: sseResponse.status,
      statusText: sseResponse.statusText,
      headers: sseResponse.headers,
    });
  } catch (err: any) {
    console.error('[aiRouter] error:', err);
    return c.json(
      {
        error: 'Internal server error',
        details: err instanceof Error ? err.message : String(err),
      },
      500,
    );
  }
});
