import { assertSecureApiUrl } from '@repo/core/api/transportSecurity';
import { createBrowserSupabaseClient } from '../supabase/browser';

export interface AiStreamMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AiStreamOptions {
  messages: AiStreamMessage[];
  aiSdk?: 'tanstack' | 'vercel';
  billingMode?: 'baseline' | 'byok' | 'purchased';
  byokKey?: string;
  privacyMode?: 'saved' | 'incognito';
  signal?: AbortSignal;
}

export interface StreamEvent {
  delta?: string;
  done?: boolean;
  tokensUsed?: number;
  raw?: unknown;
}

function apiOrigin(): string | null {
  const value = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!value) return null;
  assertSecureApiUrl(value);
  return value.replace(/\/+$/, '');
}

/**
 * Streams AI completions from Sanctuary API (/api/ai/chat) with NDJSON chunk decoding.
 */
export async function* streamAiChat(
  options: AiStreamOptions,
): AsyncGenerator<StreamEvent, void, unknown> {
  let origin: string | null;
  try {
    origin = apiOrigin();
  } catch {
    throw new Error('Sanctuary services are not configured securely in this browser.');
  }

  if (!origin) {
    throw new Error('Sanctuary API URL is not configured.');
  }

  const supabase = createBrowserSupabaseClient();
  let authToken: string | undefined;

  if (supabase) {
    const { data } = await supabase.auth.getSession();
    if (data.session?.access_token) {
      authToken = data.session.access_token;
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  if (options.aiSdk) {
    headers['x-ai-sdk'] = options.aiSdk;
  }

  const response = await fetch(`${origin}/api/ai/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      messages: options.messages,
      context: {
        aiSdk: options.aiSdk,
        billingMode: options.billingMode,
        byokKey: options.byokKey,
        privacyMode: options.privacyMode,
      },
    }),
    signal: options.signal,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`Sanctuary AI streaming request failed (${response.status}): ${errorText || response.statusText}`);
  }

  if (!response.body) {
    throw new Error('Readable stream not supported or empty response body.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        try {
          const chunk = JSON.parse(trimmed);
          if (chunk.type === 'TEXT_MESSAGE_CONTENT' && typeof chunk.delta === 'string') {
            yield { delta: chunk.delta };
          } else if (chunk.type === 'RUN_FINISHED') {
            const tokens = Array.isArray(chunk.usage)
              ? chunk.usage.reduce((sum: number, u: any) => sum + (u.totalTokens ?? 0), 0)
              : chunk.usage?.totalTokens ?? 0;
            yield { done: true, tokensUsed: tokens, raw: chunk };
          }
        } catch {
          // If chunk is not JSON, check if it's raw text
          yield { delta: trimmed };
        }
      }
    }

    if (buffer.trim()) {
      try {
        const chunk = JSON.parse(buffer.trim());
        if (chunk.type === 'TEXT_MESSAGE_CONTENT' && typeof chunk.delta === 'string') {
          yield { delta: chunk.delta };
        }
      } catch {
        yield { delta: buffer.trim() };
      }
    }
  } finally {
    reader.releaseLock();
  }
}
