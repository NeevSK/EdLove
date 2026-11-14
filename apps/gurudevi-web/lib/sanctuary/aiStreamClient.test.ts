import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getSession } = vi.hoisted(() => ({ getSession: vi.fn() }));

vi.mock('../supabase/browser', () => ({
  createBrowserSupabaseClient: () => ({ auth: { getSession } }),
}));

import { streamAiChat } from './aiStreamClient';

describe('streamAiChat client', () => {
  beforeEach(() => {
    getSession.mockReset();
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://sanctuary.example/');
    vi.stubGlobal('fetch', vi.fn());
  });

  it('streams and decodes TEXT_MESSAGE_CONTENT NDJSON chunks', async () => {
    getSession.mockResolvedValue({
      data: {
        session: {
          access_token: 'auth-token-123',
          user: { id: 'user-1', is_anonymous: false },
        },
      },
      error: null,
    });

    const streamData = [
      JSON.stringify({ type: 'TEXT_MESSAGE_CONTENT', delta: 'Hello ' }) + '\n',
      JSON.stringify({ type: 'TEXT_MESSAGE_CONTENT', delta: 'World!' }) + '\n',
      JSON.stringify({ type: 'RUN_FINISHED', usage: { totalTokens: 15 } }) + '\n',
    ];

    const stream = new ReadableStream({
      start(controller) {
        for (const chunk of streamData) {
          controller.enqueue(new TextEncoder().encode(chunk));
        }
        controller.close();
      },
    });

    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue(
      new Response(stream, {
        headers: { 'Content-Type': 'application/x-ndjson' },
        status: 200,
      }),
    );

    const events = [];
    for await (const event of streamAiChat({
      messages: [{ role: 'user', content: 'Hi' }],
      aiSdk: 'vercel',
    })) {
      events.push(event);
    }

    expect(events).toEqual([
      { delta: 'Hello ' },
      { delta: 'World!' },
      { done: true, tokensUsed: 15, raw: expect.objectContaining({ type: 'RUN_FINISHED' }) },
    ]);

    expect(fetchMock).toHaveBeenCalledWith(
      'https://sanctuary.example/api/ai/chat',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer auth-token-123',
          'x-ai-sdk': 'vercel',
        }),
      }),
    );
  });
});
