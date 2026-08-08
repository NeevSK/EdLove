import { EventType, toHttpResponse, type StreamChunk } from '@tanstack/ai';
import { describe, expect, it } from 'vitest';

function syntheticStream(): AsyncIterable<StreamChunk> {
  const events: StreamChunk[] = [
    {
      type: EventType.RUN_STARTED,
      threadId: 'thread-1',
      runId: 'run-1',
      model: 'gpt-4o-mini',
    },
    {
      type: EventType.TEXT_MESSAGE_START,
      messageId: 'msg-1',
      role: 'assistant',
    },
    { type: EventType.TEXT_MESSAGE_CONTENT, messageId: 'msg-1', delta: 'Hello' },
    { type: EventType.TEXT_MESSAGE_CONTENT, messageId: 'msg-1', delta: ' world' },
    { type: EventType.TEXT_MESSAGE_END, messageId: 'msg-1' },
    {
      type: EventType.RUN_FINISHED,
      threadId: 'thread-1',
      runId: 'run-1',
      finishReason: 'stop',
      usage: { promptTokens: 12, completionTokens: 3, totalTokens: 15 },
    },
  ];
  return {
    async *[Symbol.asyncIterator]() {
      for (const event of events) {
        yield event;
      }
    },
  };
}

describe('AI wire format (ndjson via toHttpResponse)', () => {
  it('emits newline-delimited JSON events the client parser can ingest', async () => {
    const response = toHttpResponse(syntheticStream(), {
      headers: { 'Cache-Control': 'no-cache' },
    });

    expect(response.headers.get('content-type')).toContain('application/x-ndjson');
    expect(response.headers.get('cache-control')).toBe('no-cache');

    const body = await response.text();
    const lines = body.split('\n').filter((line) => line.trim().length > 0);

    expect(lines).toHaveLength(6);

    const parsed = lines.map((line) => JSON.parse(line));
    expect(parsed[0]).toMatchObject({
      type: EventType.RUN_STARTED,
      threadId: 'thread-1',
      runId: 'run-1',
    });
    expect(parsed[1]).toMatchObject({ type: EventType.TEXT_MESSAGE_START });
    expect(parsed[2]).toMatchObject({
      type: EventType.TEXT_MESSAGE_CONTENT,
      delta: 'Hello',
    });
    expect(parsed[3]).toMatchObject({ delta: ' world' });
    expect(parsed[4]).toMatchObject({ type: EventType.TEXT_MESSAGE_END });
    expect(parsed[5]).toMatchObject({
      type: EventType.RUN_FINISHED,
      finishReason: 'stop',
      usage: { totalTokens: 15 },
    });
  });
});
