import type { AGUIEvent, AIStreamRequest, IAIProviderAdapter } from './providerPort';

/**
 * SanctuaryCloudProvider
 *
 * Default production provider streaming AG-UI protocol events
 * over HTTP SSE from Sanctuary API (/api/v1/ai or /api/ai/chat).
 */
export class SanctuaryCloudProvider implements IAIProviderAdapter {
  readonly id = 'sanctuary-cloud';
  readonly name = 'Sanctuary Cloud (Default)';
  readonly supportsStreaming = true;

  constructor(private baseUrl: string = '') {}

  async streamMessage(
    request: AIStreamRequest,
    onChunk: (event: AGUIEvent) => void,
    signal?: AbortSignal,
  ): Promise<void> {
    const endpoint = `${this.baseUrl}/api/v1/ai/chat`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        },
        body: JSON.stringify({
          threadId: request.threadId,
          messages: request.messages,
          persona: request.persona ?? 'tutii',
          context: request.context,
          privacyMode: request.privacyMode,
        }),
        signal,
      });

      if (!response.ok || !response.body) {
        throw new Error(`Sanctuary Cloud AI request failed with status ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data:')) {
            const jsonStr = trimmed.slice(5).trim();
            if (jsonStr === '[DONE]') return;
            try {
              const parsed = JSON.parse(jsonStr) as AGUIEvent;
              onChunk(parsed);
            } catch {
              // Ignore non-json heartbeats
            }
          }
        }
      }
    } catch (err: unknown) {
      if ((err as { name?: string }).name === 'AbortError') return;
      // Emit fallback notification event so the UI can gracefully reflect the status
      onChunk({
        type: 'TEXT_MESSAGE_CONTENT',
        payload: {
          delta:
            '\n\n*[Tutii was unable to reach the cloud server right now. Your message is preserved in local storage.]*',
        },
      });
      onChunk({
        type: 'RUN_FINISHED',
        payload: { status: 'failed' },
      });
    }
  }
}
