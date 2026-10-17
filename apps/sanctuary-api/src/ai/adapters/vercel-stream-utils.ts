import { EventType, type StreamChunk } from '@tanstack/ai';

function generateId(): string {
  return crypto.randomUUID();
}

interface VercelStreamEvent {
  type: string;
  text?: string;
  finishReason?: string;
  totalUsage?: { inputTokens?: number; outputTokens?: number };
  usage?: { inputTokens?: number; outputTokens?: number };
  error?: unknown;
}

export async function* vercelStreamToTanStackChunks(
  stream: AsyncIterable<VercelStreamEvent>,
  model: string,
): AsyncIterable<StreamChunk> {
  const runId = generateId();
  const threadId = generateId();
  const now = () => Date.now();
  let messageId: string | undefined;

  yield {
    type: EventType.RUN_STARTED,
    threadId,
    runId,
    metadata: { model },
    timestamp: now(),
  };

  for await (const event of stream) {
    switch (event.type) {
      case 'text-delta': {
        if (!messageId) {
          messageId = generateId();
          yield {
            type: EventType.TEXT_MESSAGE_START,
            messageId,
            role: 'assistant',
            metadata: { model },
            timestamp: now(),
          };
        }
        yield {
          type: EventType.TEXT_MESSAGE_CONTENT,
          messageId,
          delta: event.text ?? '',
          metadata: { model },
          timestamp: now(),
        };
        break;
      }
      case 'finish': {
        if (messageId) {
          yield {
            type: EventType.TEXT_MESSAGE_END,
            messageId,
            metadata: { model },
            timestamp: now(),
          };
        }
        const u = event.totalUsage ?? event.usage;
        const usage = u
          ? {
              promptTokens: u.inputTokens ?? 0,
              completionTokens: u.outputTokens ?? 0,
              totalTokens: (u.inputTokens ?? 0) + (u.outputTokens ?? 0),
            }
          : undefined;
        yield {
          type: EventType.RUN_FINISHED,
          threadId,
          runId,
          finishReason: (event.finishReason ?? null) as any,
          usage,
          model,
          timestamp: now(),
        };
        break;
      }
      case 'error': {
        const errMsg =
          event.error instanceof Error
            ? event.error.message
            : typeof event.error === 'object' && event.error && 'message' in (event.error as any)
              ? (event.error as any).message
              : 'Unknown error';
        yield {
          type: EventType.RUN_ERROR,
          runId,
          message: errMsg,
          model,
          timestamp: now(),
        };
        break;
      }
    }
  }
}
