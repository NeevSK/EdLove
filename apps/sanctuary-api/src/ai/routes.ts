import type { ContextVariableMap } from 'hono';
import { Hono } from 'hono';
import { AnthropicAdapter } from './adapters/AnthropicAdapter';
import { DbBillingAdapter } from './adapters/DbBillingAdapter';
import { DeepSeekAdapter } from './adapters/DeepSeekAdapter';
import { GeminiAdapter } from './adapters/GeminiAdapter';
import { OpenAiAdapter } from './adapters/OpenAiAdapter';
import { VercelAnthropicAdapter } from './adapters/VercelAnthropicAdapter';
import { VercelDeepSeekAdapter } from './adapters/VercelDeepSeekAdapter';
import { VercelGeminiAdapter } from './adapters/VercelGeminiAdapter';
import { VercelOpenAiAdapter } from './adapters/VercelOpenAiAdapter';
import { Orchestrator } from './domain/Orchestrator';
import { rateLimit } from './middleware/rateLimit';

type AiEnv = {
  Variables: {
    user: { id: string };
    db: any;
    requestId: string;
  } & ContextVariableMap;
};

export const aiRouter = new Hono<AiEnv>();

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

    // 1. Select SDK family via env flag
    const useVercelSdk = process.env.AI_SDK === 'vercel';

    // 2. Setup Ports & Core Domain Orchestrator with Dynamic Factory Injection
    const billingAdapter = new DbBillingAdapter(db);
    const orchestrator = new Orchestrator(billingAdapter, (provider) => {
      if (useVercelSdk) {
        switch (provider) {
          case 'gemini':
            return new VercelGeminiAdapter();
          case 'anthropic':
            return new VercelAnthropicAdapter();
          case 'deepseek':
            return new VercelDeepSeekAdapter();
          default:
            return new VercelOpenAiAdapter();
        }
      }
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

    // 3. Resolve billing info beforehand for logging accuracy
    const billingInfo = await billingAdapter
      .resolveBilling(user.id, context.billingMode ?? 'baseline', {
        byokKeyInput: context.byokKey,
        schoolId: context.schoolId,
        preferredProvider:
          context.billingMode === 'byok' ? undefined : (context.billingMode as any),
      })
      .catch(() => null);

    const start = Date.now();

    // 4. Process chat and generate SSE stream
    const originalBody = await orchestrator.processChat(user.id, message, history, context);

    // 5. Intercept stream using TransformStream to record audit log on completion
    let chunkCount = 0;
    const transformStream = new TransformStream({
      transform(chunk, controller) {
        chunkCount++;
        controller.enqueue(chunk);
      },
      flush() {
        const durationMs = Date.now() - start;
        const tokensUsed = chunkCount * 4;
        billingAdapter
          .logUsage(user.id, billingInfo?.model || 'gpt-4o-mini', tokensUsed, durationMs)
          .catch((logErr) => console.error('[aiRouter] Logging failed:', logErr));
      },
    });

    const transformedBody = originalBody.pipeThrough(transformStream);

    return new Response(transformedBody, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
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
