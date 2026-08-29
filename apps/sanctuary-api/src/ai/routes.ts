import { type StreamChunk, toHttpResponse } from '@tanstack/ai';
import { type ContextVariableMap, Hono } from 'hono';
import { AnthropicAdapter } from './adapters/AnthropicAdapter';
import { DbAiPersistenceAdapter } from './adapters/DbAiPersistenceAdapter';
import { DbBillingAdapter } from './adapters/DbBillingAdapter';
import { DeepSeekAdapter } from './adapters/DeepSeekAdapter';
import { GeminiAdapter } from './adapters/GeminiAdapter';
import { OpenAiAdapter } from './adapters/OpenAiAdapter';
import { OpenRouterAdapter } from './adapters/OpenRouterAdapter';
import { VercelAnthropicAdapter } from './adapters/VercelAnthropicAdapter';
import { VercelDeepSeekAdapter } from './adapters/VercelDeepSeekAdapter';
import { VercelGeminiAdapter } from './adapters/VercelGeminiAdapter';
import { VercelOpenAiAdapter } from './adapters/VercelOpenAiAdapter';
import { VercelOpenRouterAdapter } from './adapters/VercelOpenRouterAdapter';
import { Orchestrator } from './domain/Orchestrator';
import { rateLimit } from './middleware/rateLimit';
import { type AiPersistencePort, type AiPrivacyMode } from './ports/AiPersistencePort';
import { CircuitBreaker } from '@repo/core/lib/circuit-breaker';

type AiEnv = {
  Variables: {
    user: { id: string };
    db: any;
    requestId: string;
  } & ContextVariableMap;
};

type WireMessage = {
  role?: string;
  content?: string | Array<{ type?: string; content?: string }> | null;
};

interface RequestContext {
  role?: string;
  schoolName?: string;
  activeGaps?: Array<{
    type: string;
    title: string;
    priority: 'low' | 'medium' | 'high';
    suggestedAction: string;
  }>;
  orientationSeeds?: {
    depth_breadth: number;
    reflect_act: number;
    solo_social: number;
    steady_surge: number;
  } | null;
  moonPhase?: string;
  byokKey?: string;
  billingMode?: 'baseline' | 'byok' | 'purchased';
  schoolId?: string;
  privacyMode?: AiPrivacyMode;
}

/** Extract the user/assistant transcript from AG-UI wire messages. */
function wireToHistory(messages: WireMessage[]): Array<{
  role: 'user' | 'assistant';
  content: string;
}> {
  return messages
    .filter((m) => m?.role === 'user' || m?.role === 'assistant')
    .map((m) => {
      let content = '';
      if (typeof m.content === 'string') {
        content = m.content;
      } else if (Array.isArray(m.content)) {
        content = m.content
          .filter((p) => p?.type === 'text')
          .map((p) => p.content ?? '')
          .join('');
      }
      return { role: m.role as 'user' | 'assistant', content };
    })
    .filter((m) => m.content.length > 0);
}

export const aiRouter = new Hono<AiEnv>();

async function collectStudentPotentialInsight(
  userId: string,
  db: any,
  studentName: string,
  analysis: Record<string, unknown>,
) {
  const useVercelSdk = process.env.AI_SDK === 'vercel';
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
        case 'openrouter':
          return new VercelOpenRouterAdapter();
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
      case 'openrouter':
        return new OpenRouterAdapter();
      default:
        return new OpenAiAdapter();
    }
  });
  const prompt = [
    `Analyze student potential for ${studentName}.`,
    `Cognitive flow: ${analysis.cognitive_flow ?? 'unknown'}%.`,
    `Emotional resonance: ${analysis.emotional_resonance ?? 'unknown'}%.`,
    `Social weaving: ${analysis.social_weaving ?? 'unknown'}%.`,
    `Creative spark: ${analysis.creative_spark ?? 'unknown'}%.`,
    `Practical mastery: ${analysis.practical_mastery ?? 'unknown'}%.`,
    `Silver lining: ${analysis.silver_lining ?? 'None recorded'}.`,
    'Provide three nurturing intervention suggestions. Avoid rankings, labels, diagnoses, or score-based judgments.',
  ].join(' ');
  const rawStream = await orchestrator.processChat(
    userId,
    prompt,
    [{ role: 'user', content: prompt }],
    { role: 'teacher' },
  );
  let reply = '';
  let textChunkCount = 0;
  for await (const chunk of rawStream) {
    if (chunk.type === 'TEXT_MESSAGE_CONTENT') {
      textChunkCount++;
      const part = chunk.content as { text?: string } | undefined;
      if (part?.text) reply += part.text;
    }
  }
  if (!reply)
    throw new Error(`AI returned no student-potential insight (${textChunkCount} text chunks)`);
  return reply;
}

aiRouter.post('/chat', rateLimit, async (c) => {
  const user = c.get('user');
  const db = c.get('db');

  if (!user || user.id === 'anonymous') {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const body = await c.req.json();
    // AG-UI RunAgentInput: messages at top level, app state in forwardedProps/data.
    const messages: WireMessage[] = body.messages ?? body.state?.messages ?? [];
    const forwardedProps: Record<string, any> = body.forwardedProps ?? body.data ?? {};
    const context: RequestContext = forwardedProps.context ?? body.context ?? {};

    if (messages.length === 0) {
      return c.json({ error: 'Message is required' }, 400);
    }

    const history = wireToHistory(messages);
    if (history.length === 0) {
      return c.json({ error: 'Message is required' }, 400);
    }

    // 1. Select SDK family via env flag
    const useVercelSdk = process.env.AI_SDK === 'vercel';

    // 2. Setup Ports & Core Domain Orchestrator with Dynamic Factory Injection
    const billingAdapter = new DbBillingAdapter(db);
    const persistenceAdapter: AiPersistencePort = new DbAiPersistenceAdapter(db);
    const privacyMode: AiPrivacyMode = context.privacyMode ?? 'saved';
    const orchestrator = new Orchestrator(billingAdapter, (provider) => {
      if (useVercelSdk) {
        switch (provider) {
          case 'gemini':
            return new VercelGeminiAdapter();
          case 'anthropic':
            return new VercelAnthropicAdapter();
          case 'deepseek':
            return new VercelDeepSeekAdapter();
          case 'openrouter':
            return new VercelOpenRouterAdapter();
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
        case 'openrouter':
          return new OpenRouterAdapter();
        default:
          return new OpenAiAdapter();
      }
    });

    // Circuit breaker for AI service
    const aiCircuitBreaker = new CircuitBreaker({
      failureThreshold: 5,
      resetTimeout: 60_000,
      successThreshold: 2,
      onOpen: () => console.warn('[CircuitBreaker] AI service circuit opened'),
      onClose: () => console.info('[CircuitBreaker] AI service circuit closed'),
      onHalfOpen: () => console.info('[CircuitBreaker] AI service circuit half-open, testing recovery'),
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

    // 4. Process chat — the last user message is the current turn
    const lastUser = [...history].reverse().find((m) => m.role === 'user');
    const rawStream = await aiCircuitBreaker.execute(() =>
      orchestrator.processChat(
        user.id,
        lastUser?.content ?? '',
        history,
        context,
      )
    );

    // 5. Wrap the chunk stream to record the audit log on completion
    let textChunkCount = 0;
    let tokensUsed = 0;
    let assistantText = '';
    async function* auditStream(source: AsyncIterable<StreamChunk>): AsyncIterable<StreamChunk> {
      for await (const chunk of source) {
        if (chunk.type === 'TEXT_MESSAGE_CONTENT') {
          textChunkCount++;
          const part = chunk.content as { text?: string } | undefined;
          if (part?.text) assistantText += part.text;
        }
        if (chunk.type === 'RUN_FINISHED' && chunk.usage) {
          tokensUsed = chunk.usage.totalTokens ?? 0;
        }
        yield chunk;
      }
      const durationMs = Date.now() - start;

      // 5a. Persist the exchange (user turn + assistant reply) when not incognito
      if (privacyMode !== 'incognito') {
        const threadId = body.threadId ?? body.runId ?? 'anon';
        if (lastUser?.content) {
          await persistenceAdapter
            .persistMessage({
              userId: user.id,
              threadId,
              role: 'user',
              content: lastUser.content,
              privacyMode,
              createdAt: new Date(start),
            })
            .catch((persistErr: unknown) =>
              console.error('[aiRouter] Persist user message failed:', persistErr),
            );
        }
        if (assistantText) {
          await persistenceAdapter
            .persistMessage({
              userId: user.id,
              threadId,
              role: 'assistant',
              content: assistantText,
              privacyMode,
              createdAt: new Date(),
            })
            .catch((persistErr: unknown) =>
              console.error('[aiRouter] Persist assistant message failed:', persistErr),
            );
        }
      }

      // 5b. Usage logging — skipped for incognito so no billing trace is recorded
      if (privacyMode !== 'incognito') {
        const loggedTokens = tokensUsed || textChunkCount * 4;
        billingAdapter
          .logUsage(user.id, billingInfo?.model || 'gpt-4o-mini', loggedTokens, durationMs)
          .catch((logErr: unknown) => console.error('[aiRouter] Logging failed:', logErr));
      }
    }

    // 6. Encode chunks as newline-delimited JSON
    return toHttpResponse(auditStream(rawStream), {
      headers: { 'Cache-Control': 'no-cache' },
    });
  } catch (err: any) {
    const requestId = c.get('requestId') || 'unknown';
    console.error(`[aiRouter] request ${requestId} failed:`, err);
    return c.json(
      {
        error: 'INTERNAL_SERVER_ERROR',
        request_id: requestId,
      },
      500,
    );
  }
});

aiRouter.post('/student-potential', rateLimit, async (c) => {
  const user = c.get('user');
  const db = c.get('db');
  if (!user || user.id === 'anonymous') return c.json({ error: 'Unauthorized' }, 401);
  try {
    const body = await c.req.json();
    if (typeof body.studentName !== 'string' || !body.studentName.trim() || !body.analysis) {
      return c.json({ error: 'Invalid student-potential request' }, 400);
    }
    const reply = await collectStudentPotentialInsight(
      user.id,
      db,
      body.studentName.trim().slice(0, 200),
      body.analysis,
    );
    return c.json({ reply }, 200);
  } catch (err) {
    const requestId = c.get('requestId') || 'unknown';
    console.error(`[aiRouter] student-potential request ${requestId} failed:`, err);
    return c.json({ error: 'AI_INSIGHT_UNAVAILABLE', request_id: requestId }, 503);
  }
});
