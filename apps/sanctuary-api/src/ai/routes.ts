import { CircuitBreaker } from '@repo/core/lib/circuit-breaker';
import { SovereignError } from '@repo/core/types/Errors';
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

const MAX_CHAT_MESSAGES = 50;
const MAX_CHAT_MESSAGE_CHARS = 16_000;
const MAX_CHAT_TRANSCRIPT_CHARS = 80_000;

// This must outlive an individual request. A request-local breaker always
// starts closed and cannot protect the provider during an outage.
const aiCircuitBreaker = new CircuitBreaker({
  failureThreshold: 5,
  resetTimeout: 60_000,
  successThreshold: 2,
  onOpen: () => console.warn('[CircuitBreaker] AI service circuit opened'),
  onClose: () => console.info('[CircuitBreaker] AI service circuit closed'),
  onHalfOpen: () => console.info('[CircuitBreaker] AI service circuit half-open, testing recovery'),
});

function parseWireMessages(value: unknown): WireMessage[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_CHAT_MESSAGES) {
    throw SovereignError.invalidInput('Provide between 1 and 50 chat messages.');
  }
  for (const message of value) {
    if (!message || typeof message !== 'object') {
      throw SovereignError.invalidInput('Each chat message must be an object.');
    }
    const content = (message as WireMessage).content;
    if (typeof content === 'string' && content.length > MAX_CHAT_MESSAGE_CHARS) {
      throw SovereignError.invalidInput('A chat message is too long.');
    }
    if (Array.isArray(content)) {
      for (const part of content) {
        if (typeof part?.content === 'string' && part.content.length > MAX_CHAT_MESSAGE_CHARS) {
          throw SovereignError.invalidInput('A chat message is too long.');
        }
      }
    }
  }
  return value as WireMessage[];
}

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
    const body = await c.req.json<{
      messages?: unknown;
      state?: { messages?: unknown };
      forwardedProps?: Record<string, unknown>;
      data?: Record<string, unknown>;
      context?: unknown;
      threadId?: unknown;
      runId?: unknown;
    }>();
    // AG-UI RunAgentInput: messages at top level, app state in forwardedProps/data.
    const messages = parseWireMessages(body.messages ?? body.state?.messages);
    const forwardedProps = body.forwardedProps ?? body.data ?? {};
    const contextValue = forwardedProps.context ?? body.context ?? {};
    const context =
      contextValue && typeof contextValue === 'object' ? (contextValue as RequestContext) : {};

    const history = wireToHistory(messages);
    if (history.length === 0) {
      throw SovereignError.invalidInput('At least one user or assistant message is required.');
    }
    if (
      history.reduce((total, message) => total + message.content.length, 0) >
      MAX_CHAT_TRANSCRIPT_CHARS
    ) {
      throw SovereignError.invalidInput('The chat transcript is too long.');
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
      orchestrator.processChat(user.id, lastUser?.content ?? '', history, context),
    );

    // 5. Wrap the chunk stream to record the audit log on completion
    let textChunkCount = 0;
    let tokensUsed = 0;
    let assistantText = '';
    async function* auditStream(source: AsyncIterable<StreamChunk>): AsyncIterable<StreamChunk> {
      for await (const chunk of source) {
        if (chunk.type === 'TEXT_MESSAGE_CONTENT') {
          textChunkCount++;
          const delta = (chunk as { delta?: string }).delta;
          if (delta) assistantText += delta;
        }
        if (chunk.type === 'RUN_FINISHED' && chunk.usage) {
          if (Array.isArray(chunk.usage)) {
            tokensUsed = chunk.usage.reduce((sum, u) => sum + (u.totalTokens ?? 0), 0);
          } else {
            tokensUsed = (chunk.usage as { totalTokens?: number }).totalTokens ?? 0;
          }
        }
        yield chunk;
      }
      const durationMs = Date.now() - start;

      // 5a. Persist the exchange (user turn + assistant reply) when not incognito
      if (privacyMode !== 'incognito') {
        const requestedThreadId = body.threadId ?? body.runId;
        const threadId =
          typeof requestedThreadId === 'string' && requestedThreadId.length <= 128
            ? requestedThreadId
            : 'anon';
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
  } catch (err: unknown) {
    const requestId = c.get('requestId') || 'unknown';
    console.error(`[aiRouter] request ${requestId} failed`, err);
    if (err instanceof SovereignError) throw err;
    if (err instanceof SyntaxError) {
      throw SovereignError.invalidInput('The request body must be valid JSON.');
    }
    throw SovereignError.unavailable('AI_PROVIDER_UNAVAILABLE');
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
